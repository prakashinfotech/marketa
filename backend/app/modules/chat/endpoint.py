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
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast_to_room(self, message: dict, room_id: int):
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
    try:
        response = crud.chat.get_messages(db=db, room_id=room_id, user_id=current_user.id)
        return JSONResponse(
            status_code=200 if response.get("success") else 400,
            content=response
        )
    except Exception as e:
        _logger.exception("Error fetching messages")
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
    token: str = Query(...),
):
    """WebSocket connection for a specific chat room."""
    # We need a new db session for the websocket
    from app.db.session import SessionLocal
    db = SessionLocal()
    
    try:
        user = await get_user_from_token(token, db)
        if not user:
            await websocket.close(code=1008)
            return

        # Check if user is part of the room
        room = db.query(crud.ChatRoom).filter(crud.ChatRoom.id == room_id).first()
        if not room or (room.buyer_id != user.id and room.seller_id != user.id):
            await websocket.close(code=1008)
            return

        await manager.connect(websocket, room_id)
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                
                # Save to database
                saved = crud.chat.save_message(db=db, room_id=room_id, sender_id=user.id, content=data)
                
                if saved["success"]:
                    # Broadcast to all users in the room
                    await manager.broadcast_to_room(saved["data"], room_id)
                
        except WebSocketDisconnect:
            manager.disconnect(websocket, room_id)
    finally:
        db.close()
