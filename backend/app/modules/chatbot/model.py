"""
Database model for the Chatbot knowledge base.
Stores document chunks with pgvector embeddings for RAG retrieval.
"""

from sqlalchemy import Column, Integer, String, Text, Boolean
from pgvector.sqlalchemy import Vector

from app.db.session import Base
from common_models import CommonModelMixin


class KnowledgeChunk(Base, CommonModelMixin):
    """
    Stores a chunk of text from an uploaded knowledge document,
    along with its vector embedding for similarity search.

    Uses pgvector's Vector type for cosine similarity retrieval.
    Embedding dimension: 384 (all-MiniLM-L6-v2 model).
    """
    __tablename__ = "knowledge_chunks"

    doc_id = Column(String(200), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    filename = Column(String(300), nullable=True)
    embedding = Column(Vector(384), nullable=False)  # all-MiniLM-L6-v2 = 384 dims


class FAQ(Base, CommonModelMixin):
    """
    Stores admin-managed FAQ entries.
    The chatbot checks these before calling the LLM.
    """
    __tablename__ = "faqs"

    question = Column(String(500), nullable=False)
    keywords = Column(Text, nullable=False)  # comma-separated keywords
    answer = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

