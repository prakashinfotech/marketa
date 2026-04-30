"""
Chatbot (RAG) API Endpoints.

Routes:
  POST /chatbot/ask/            — Public: ask a question
  POST /chatbot/upload-doc/     — SuperAdmin: upload a knowledge document
  GET  /chatbot/documents/      — SuperAdmin: list indexed documents
  DELETE /chatbot/documents/{id}/ — SuperAdmin: remove a document
"""

import logging
import uuid
import os

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.api.deps import get_current_user
from app.modules.users.model import User
from app.modules.chatbot import schema, crud

_logger = logging.getLogger(__name__)

router = APIRouter()

ALLOWED_EXTENSIONS = {".md", ".txt", ".pdf"}
KNOWLEDGE_DOCS_DIR = os.path.join(os.path.dirname(__file__), "../../../../knowledge_docs")
os.makedirs(KNOWLEDGE_DOCS_DIR, exist_ok=True)


def _is_superadmin(user: User) -> bool:
    return user.role_id in (1, 2)


# ── Public Endpoint ──────────────────────────────────────────────────────────

@router.post("/ask/")
def ask_chatbot(
    payload: schema.ChatbotAskRequest,
    db: Session = Depends(get_db),
):
    """
    Public endpoint: accepts a user question and returns a RAG-grounded answer.
    No authentication required.
    """
    _logger.info("Incoming chatbot query request.")
    if not payload.message or not payload.message.strip():
        return JSONResponse(
            status_code=400,
            content={"success": False, "msg": "Message cannot be empty.", "data": {}}
        )
    try:
        result = crud.ask(db, payload.message)
        return JSONResponse(
            status_code=200,
            content={"success": True, "msg": "OK", "data": result}
        )
    except Exception as e:
        _logger.exception("Chatbot ask error: %s", e)
        return JSONResponse(
            status_code=500,
            content={
                "success": True,
                "msg": "OK",
                "data": {
                    "answer": "I'm having trouble right now. Please try again shortly!",
                    "source": "fallback",
                }
            }
        )


# ── SuperAdmin Endpoints ─────────────────────────────────────────────────────

@router.post("/upload-doc/")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    SuperAdmin: Upload a knowledge document (Markdown, TXT, or PDF).
    The document is chunked and embedded into pgvector.
    """
    _logger.info("Incoming document upload request from user: %s", current_user.email)
    if not _is_superadmin(current_user):
        raise HTTPException(status_code=403, detail="SuperAdmin access required.")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return JSONResponse(
            status_code=400,
            content={"success": False, "msg": f"Unsupported file type '{ext}'. Use .md, .txt, or .pdf"}
        )

    raw = await file.read()

    # Decode content
    if ext == ".pdf":
        try:
            import pdfminer.high_level as pdfminer
            import io
            text = pdfminer.extract_text(io.BytesIO(raw))
        except ImportError:
            return JSONResponse(
                status_code=500,
                content={"success": False, "msg": "PDF support requires 'pdfminer.six'. Install it first."}
            )
    else:
        text = raw.decode("utf-8", errors="ignore")

    if not text.strip():
        return JSONResponse(
            status_code=400,
            content={"success": False, "msg": "Document appears to be empty."}
        )

    # Use filename as doc_id (sanitized)
    doc_id = os.path.splitext(file.filename or str(uuid.uuid4()))[0]
    doc_id = doc_id.replace(" ", "_").lower()

    # Save file locally for reference
    save_path = os.path.join(KNOWLEDGE_DOCS_DIR, f"{doc_id}{ext}")
    with open(save_path, "wb") as f:
        f.write(raw)

    # Index into pgvector
    chunks = crud.index_document(db=db, doc_id=doc_id, text_content=text, metadata={"filename": file.filename})

    _logger.info("Document '%s' indexed with %d chunks by user %s", doc_id, chunks, current_user.id)

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "msg": f"Document '{file.filename}' indexed successfully!",
            "data": {"doc_id": doc_id, "chunks_indexed": chunks}
        }
    )


@router.get("/documents/")
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """SuperAdmin: List all indexed knowledge document IDs."""
    _logger.info("Incoming list documents request from user: %s", current_user.email)
    if not _is_superadmin(current_user):
        raise HTTPException(status_code=403, detail="SuperAdmin access required.")

    doc_ids = crud.list_documents(db)
    return JSONResponse(
        status_code=200,
        content={"success": True, "msg": "OK", "data": doc_ids}
    )


@router.delete("/documents/{doc_id}/")
def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """SuperAdmin: Delete a knowledge document from the vector store."""
    _logger.info("Incoming delete document request for doc_id: %s from user: %s", doc_id, current_user.email)
    if not _is_superadmin(current_user):
        raise HTTPException(status_code=403, detail="SuperAdmin access required.")

    deleted = crud.delete_document(db, doc_id)
    if deleted:
        return JSONResponse(
            status_code=200,
            content={"success": True, "msg": f"Document '{doc_id}' deleted successfully.", "data": {}}
        )
    return JSONResponse(
        status_code=404,
        content={"success": False, "msg": f"Document '{doc_id}' not found.", "data": {}}
    )


# ── FAQ Management Endpoints ────────────────────────────────────────────────

@router.get("/faqs/")
def list_faqs(
    db: Session = Depends(get_db),
):
    """Public: List all FAQs for suggestions."""
    faqs = crud.list_faqs(db)
    return JSONResponse(status_code=200, content={"success": True, "data": faqs})



@router.post("/faqs/")
def create_faq(
    payload: schema.FAQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin: Create a new FAQ."""
    if not _is_superadmin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required.")
    result = crud.create_faq(db, question=payload.question, keywords=payload.keywords, answer=payload.answer)
    return JSONResponse(
        status_code=200 if result.get("success") else 400,
        content=result
    )


@router.put("/faqs/{faq_id}/")
def update_faq(
    faq_id: int,
    payload: schema.FAQUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin: Update a FAQ."""
    if not _is_superadmin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required.")
    data = payload.model_dump(exclude_unset=True)
    result = crud.update_faq(db, faq_id=faq_id, data=data)
    return JSONResponse(
        status_code=200 if result.get("success") else 400,
        content=result
    )


@router.delete("/faqs/{faq_id}/")
def delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin: Delete a FAQ."""
    if not _is_superadmin(current_user):
        raise HTTPException(status_code=403, detail="Admin access required.")
    result = crud.delete_faq(db, faq_id=faq_id)
    return JSONResponse(
        status_code=200 if result.get("success") else 404,
        content=result
    )

