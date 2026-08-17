import logging
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Dict
import json

from app.db.deps import get_db
from app.modules.chat import schema, crud
from app.core.security import verify_password
from jose import jwt, JWTError
from app.core.config import settings
from app.api.deps import get_current_user
from app.modules.users.model import User

_logger = logging.getLogger(__name__)

router = APIRouter()

# ── Connection Manager for WebSockets ────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        # Maps room_id to a list of active WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: int):
        _logger.info(f"WebSocket connection request for room_id={room_id}")
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: int):
        _logger.info(f"WebSocket disconnected from room_id={room_id}")
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast_to_room(self, message: dict, room_id: int):
        _logger.info(f"Broadcasting message to room_id={room_id}")
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    _logger.error(f"Error sending message to websocket: {str(e)}")

manager = ConnectionManager()


# ── REST Endpoints ───────────────────────────────────────────────────────────

from fastapi.responses import JSONResponse

@router.post("/rooms/")
def create_or_get_room(
    payload: schema.ChatRoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initiates a chat with the seller of an ad."""
    _logger.info(f"Incoming room create/get request from user_id={current_user.id}")
    try:
        response = crud.chat.get_or_create_room(db=db, buyer_id=current_user.id, ad_id=payload.ad_id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response
        )
    except Exception as e:
        _logger.exception("Error initiating chat")
        return JSONResponse(status_code=500, content={"success": False, "msg": "Internal server error", "data": {}})

@router.get("/rooms/")
def list_my_rooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Gets all chat rooms for the current user."""
    _logger.info(f"Incoming list rooms request from user_id={current_user.id}")
    try:
        response = crud.chat.get_user_rooms(db=db, user_id=current_user.id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response
        )
    except Exception as e:
        _logger.exception("Error fetching rooms")
        return JSONResponse(status_code=500, content={"success": False, "msg": "Internal server error", "data": []})

@router.get("/rooms/{room_id}/messages")
def get_room_messages(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Gets all messages for a specific room."""
    _logger.info(f"Incoming get messages request for room_id={room_id} from user_id={current_user.id}")
    try:
        response = crud.chat.get_messages(db=db, room_id=room_id, user_id=current_user.id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response
        )
    except Exception as e:
        _logger.exception("Error fetching messages")
        return JSONResponse(status_code=500, content={"success": False, "msg": "Internal server error", "data": []})


@router.get("/unread-count/")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns total unread message count for the current user."""
    count = crud.chat.get_total_unread_count(db=db, user_id=current_user.id)
    return JSONResponse(status_code=200, content={"success": True, "data": {"unread_count": count}})


@router.get("/inquiries/")
def get_seller_inquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns all chat inquiries grouped by ad for the seller."""
    _logger.info(f"Incoming seller inquiries request from user_id={current_user.id}")
    try:
        response = crud.chat.get_seller_inquiries(db=db, seller_id=current_user.id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response
        )
    except Exception as e:
        _logger.exception("Error fetching seller inquiries")
        return JSONResponse(status_code=500, content={"success": False, "msg": "Internal server error", "data": []})


# ── WebSocket Endpoint ───────────────────────────────────────────────────────

async def get_user_from_token(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    token: str | None = Query(default=None),
):
    """
    WebSocket connection for a specific chat room.

    Auth:
      * Preferred: open the socket, then send `{"type": "auth", "token": "<jwt>"}`
        as the first message. This avoids leaking JWTs via URL/access logs.
      * Back-compat: clients may still pass `?token=<jwt>` in the URL.

    Subsequent messages are treated as chat content:
      * If the message is JSON with `{"type": "message", "content": "..."}` we
        use `content`; otherwise the raw text is stored as the message body.
    """
    from app.db.session import SessionLocal
    db = SessionLocal()
    user = None

    try:
        # Accept first so we can negotiate auth on the wire
        await websocket.accept()

        if not token:
            # Wait briefly for the auth handshake message
            try:
                first = await websocket.receive_json()
                if isinstance(first, dict) and first.get("type") == "auth":
                    token = first.get("token")
            except Exception:
                token = None

        if not token:
            await websocket.close(code=1008)
            return

        user = await get_user_from_token(token, db)
        if not user:
            await websocket.close(code=1008)
            return

        room = db.query(crud.ChatRoom).filter(crud.ChatRoom.id == room_id).first()
        if not room or (room.buyer_id != user.id and room.seller_id != user.id):
            await websocket.close(code=1008)
            return

        # Register the already-accepted socket with the manager.
        if room_id not in manager.active_connections:
            manager.active_connections[room_id] = []
        manager.active_connections[room_id].append(websocket)

        try:
            while True:
                raw = await websocket.receive_text()
                content = raw
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, dict):
                        if parsed.get("type") == "ping":
                            continue
                        if parsed.get("type") == "message" and parsed.get("content"):
                            content = str(parsed["content"])
                except (json.JSONDecodeError, ValueError):
                    pass  # treat as plain text

                saved = crud.chat.save_message(db=db, room_id=room_id, sender_id=user.id, content=content)
                if saved["success"]:
                    await manager.broadcast_to_room(saved["data"], room_id)

        except WebSocketDisconnect:
            manager.disconnect(websocket, room_id)
    finally:
        db.close()
