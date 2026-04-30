"""
Pydantic schemas for the Chatbot / RAG module.
"""

from pydantic import BaseModel
from typing import Optional


class ChatbotAskRequest(BaseModel):
    message: str


class ChatbotAskResponse(BaseModel):
    answer: str
    source: str = "rag"  # "rag" | "chitchat" | "fallback"


class DocumentUploadResponse(BaseModel):
    success: bool
    msg: str
    chunks_indexed: Optional[int] = None


class FAQCreate(BaseModel):
    question: str
    keywords: str  # comma-separated
    answer: str


class FAQUpdate(BaseModel):
    question: Optional[str] = None
    keywords: Optional[str] = None
    answer: Optional[str] = None
    is_active: Optional[bool] = None

