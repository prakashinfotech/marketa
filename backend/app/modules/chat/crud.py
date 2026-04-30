import logging
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime

from app.modules.chat.model import ChatRoom, Message
from app.modules.ads.model import Ad
from app.modules.users.model import User

_logger = logging.getLogger(__name__)

class ChatCRUD:
    def get_or_create_room(self, db: Session, buyer_id: int, ad_id: int) -> dict:
        """Finds existing chat room or creates a new one for buyer and ad."""
        _logger.info("Chat room request: buyer_id=%d, ad_id=%d", buyer_id, ad_id)
        try:
            ad = db.query(Ad).filter(Ad.id == ad_id, Ad.is_delete.isnot(True)).first()
            if not ad:
                return {"success": False, "msg": "Ad not found."}
            
            if ad.user_id == buyer_id:
                return {"success": False, "msg": "You cannot chat on your own ad."}

            room = db.query(ChatRoom).filter(
                ChatRoom.ad_id == ad_id,
                ChatRoom.buyer_id == buyer_id,
                ChatRoom.is_delete.isnot(True)
            ).first()

            if not room:
                room = ChatRoom(
                    ad_id=ad_id,
                    buyer_id=buyer_id,
                    seller_id=ad.user_id,
                    last_message_at=datetime.utcnow()
                )
                db.add(room)
                db.commit()
                db.refresh(room)
                _logger.info("New chat room created: id=%d", room.id)

            return {"success": True, "msg": "Chat room ready.", "data": {"room_id": room.id}}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error creating chat room: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}

    def get_user_rooms(self, db: Session, user_id: int) -> dict:
        """Get all chat rooms where the user is either buyer or seller."""
        _logger.info("Fetching chat rooms for user_id=%d", user_id)
        try:
            rooms = (
                db.query(ChatRoom)
                .filter(
                    (ChatRoom.buyer_id == user_id) | (ChatRoom.seller_id == user_id),
                    ChatRoom.is_delete.isnot(True)
                )
                .options(
                    joinedload(ChatRoom.ad).joinedload(Ad.images),
                    joinedload(ChatRoom.buyer),
                    joinedload(ChatRoom.seller),
                )
                .order_by(ChatRoom.last_message_at.desc())
                .all()
            )

            results = []
            for r in rooms:
                is_buyer = (r.buyer_id == user_id)
                other_user = r.seller if is_buyer else r.buyer
                primary_img = next((img for img in r.ad.images if img.is_primary), None) if r.ad and r.ad.images else None

                # Get last message
                last_msg = db.query(Message).filter(
                    Message.chat_room_id == r.id, 
                    Message.is_delete.isnot(True)
                ).order_by(Message.created_at.desc()).first()

                # Get unread count for this user
                unread = db.query(Message).filter(
                    Message.chat_room_id == r.id,
                    Message.sender_id != user_id,
                    Message.is_read == False,
                    Message.is_delete.isnot(True)
                ).count()

                results.append({
                    "id": r.id,
                    "ad_id": r.ad_id,
                    "buyer_id": r.buyer_id,
                    "seller_id": r.seller_id,
                    "last_message_at": str(r.last_message_at) if r.last_message_at else None,
                    "created_at": str(r.created_at) if r.created_at else None,
                    "ad_title": r.ad.title if r.ad else "Unknown Ad",
                    "ad_status": r.ad.status if r.ad else None,
                    "ad_image": primary_img.image_url if primary_img else None,
                    "other_user_name": other_user.name if other_user else "Unknown User",
                    "other_user_avatar": other_user.avatar if other_user else None,
                    "last_message": last_msg.content if last_msg else None,
                    "unread_count": unread
                })

            return {"success": True, "msg": "Rooms fetched.", "data": results}
        except SQLAlchemyError as e:
            _logger.error("Database error fetching user rooms: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": []}

    def get_messages(self, db: Session, room_id: int, user_id: int) -> dict:
        """Get all messages in a room, and mark them as read for the user."""
        _logger.info("Fetching messages for room_id=%d, user_id=%d", room_id, user_id)
        try:
            room = db.query(ChatRoom).filter(ChatRoom.id == room_id, ChatRoom.is_delete.isnot(True)).first()
            if not room:
                return {"success": False, "msg": "Room not found."}
            if room.buyer_id != user_id and room.seller_id != user_id:
                return {"success": False, "msg": "Unauthorized."}

            messages = (
                db.query(Message)
                .filter(Message.chat_room_id == room_id, Message.is_delete.isnot(True))
                .order_by(Message.created_at.asc())
                .all()
            )

            # Mark unread messages from the other user as read
            unread_msgs = [m for m in messages if m.sender_id != user_id and not m.is_read]
            if unread_msgs:
                for m in unread_msgs:
                    m.is_read = True
                db.commit()

            data = [
                {
                    "id": m.id,
                    "sender_id": m.sender_id,
                    "content": m.content,
                    "is_read": m.is_read,
                    "created_at": str(m.created_at) if m.created_at else None,
                }
                for m in messages
            ]
            return {"success": True, "msg": "Messages fetched.", "data": data}
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error fetching messages: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": []}

    def save_message(self, db: Session, room_id: int, sender_id: int, content: str) -> dict:
        """Saves a new message and updates the room's last_message_at."""
        _logger.info("Saving message: room_id=%d, sender_id=%d", room_id, sender_id)
        try:
            msg = Message(
                chat_room_id=room_id,
                sender_id=sender_id,
                content=content,
                is_read=False
            )
            db.add(msg)
            
            # Update room
            room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
            if room:
                room.last_message_at = datetime.utcnow()
            
            db.commit()
            db.refresh(msg)
            
            return {
                "success": True, 
                "msg": "Message saved.", 
                "data": {
                    "id": msg.id,
                    "sender_id": msg.sender_id,
                    "content": msg.content,
                    "is_read": msg.is_read,
                    "created_at": str(msg.created_at)
                }
            }
        except SQLAlchemyError as e:
            db.rollback()
            _logger.error("Database error saving message: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": {}}

    def get_total_unread_count(self, db: Session, user_id: int) -> int:
        """Returns total unread message count across all rooms for a user."""
        try:
            count = db.query(Message).join(ChatRoom, Message.chat_room_id == ChatRoom.id).filter(
                (ChatRoom.buyer_id == user_id) | (ChatRoom.seller_id == user_id),
                ChatRoom.is_delete.isnot(True),
                Message.sender_id != user_id,
                Message.is_read == False,
                Message.is_delete.isnot(True),
            ).count()
            return count
        except SQLAlchemyError:
            return 0

    def get_seller_inquiries(self, db: Session, seller_id: int) -> dict:
        """Get all chat rooms grouped by ad where the user is the seller."""
        _logger.info("Fetching seller inquiries for user_id=%d", seller_id)
        try:
            from app.modules.ads.model import AdImage
            rooms = (
                db.query(ChatRoom)
                .filter(
                    ChatRoom.seller_id == seller_id,
                    ChatRoom.is_delete.isnot(True),
                )
                .options(
                    joinedload(ChatRoom.ad).joinedload(Ad.images),
                    joinedload(ChatRoom.buyer),
                )
                .order_by(ChatRoom.last_message_at.desc())
                .all()
            )

            # Group by ad_id
            ad_groups = {}
            for r in rooms:
                if not r.ad or r.ad.is_delete:
                    continue
                ad_id = r.ad_id
                if ad_id not in ad_groups:
                    primary_img = next(
                        (img for img in r.ad.images if img.is_primary), None
                    ) if r.ad.images else None
                    ad_groups[ad_id] = {
                        "ad_id": ad_id,
                        "ad_title": r.ad.title,
                        "ad_price": str(r.ad.price) if r.ad.price else None,
                        "ad_status": r.ad.status,
                        "ad_image": primary_img.image_url if primary_img else None,
                        "total_inquiries": 0,
                        "total_unread": 0,
                        "buyers": [],
                    }

                # Per-room stats
                last_msg = (
                    db.query(Message)
                    .filter(Message.chat_room_id == r.id, Message.is_delete.isnot(True))
                    .order_by(Message.created_at.desc())
                    .first()
                )
                unread = (
                    db.query(Message)
                    .filter(
                        Message.chat_room_id == r.id,
                        Message.sender_id != seller_id,
                        Message.is_read == False,
                        Message.is_delete.isnot(True),
                    )
                    .count()
                )
                msg_count = (
                    db.query(Message)
                    .filter(Message.chat_room_id == r.id, Message.is_delete.isnot(True))
                    .count()
                )

                buyer = r.buyer
                ad_groups[ad_id]["total_inquiries"] += 1
                ad_groups[ad_id]["total_unread"] += unread
                ad_groups[ad_id]["buyers"].append({
                    "room_id": r.id,
                    "buyer_id": buyer.id if buyer else None,
                    "buyer_name": buyer.name if buyer else "Unknown",
                    "buyer_avatar": buyer.avatar if buyer else None,
                    "last_message": last_msg.content if last_msg else None,
                    "last_message_at": str(r.last_message_at) if r.last_message_at else None,
                    "message_count": msg_count,
                    "unread_count": unread,
                })

            # Sort groups: those with unread messages first, then by latest activity
            result = sorted(
                ad_groups.values(),
                key=lambda g: (g["total_unread"] > 0, g["buyers"][0]["last_message_at"] or ""),
                reverse=True,
            )
            return {"success": True, "msg": "Inquiries fetched.", "data": result}
        except SQLAlchemyError as e:
            _logger.error("Database error fetching seller inquiries: %s", str(e))
            return {"success": False, "msg": "Database error.", "data": []}

chat = ChatCRUD()
