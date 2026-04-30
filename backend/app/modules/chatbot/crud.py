"""
RAG (Retrieval-Augmented Generation) CRUD for the Chatbot module.

Flow:
  1. Documents are chunked, embedded via sentence-transformers, and stored in PostgreSQL (pgvector).
  2. On each user question:
     a. Static FAQ keywords → instant pre-written answer (no API call).
     b. Chitchat is handled directly via Groq (no retrieval).
     c. Everything else → embed question → retrieve top-K chunks via pgvector → generate answer via Groq.

Dependencies:
  pip install pgvector sentence-transformers groq
"""

import os
import re
import logging
from typing import Optional, List

from groq import Groq
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.modules.chatbot.model import KnowledgeChunk, FAQ

_logger = logging.getLogger(__name__)

# ── Embedding Model (local, free, no API key) ───────────────────────────────
# all-MiniLM-L6-v2 → 384-dimensional embeddings, very fast
_logger.info("Loading sentence-transformer model (all-MiniLM-L6-v2)...")
_embed_model = SentenceTransformer("all-MiniLM-L6-v2")
_logger.info("Embedding model loaded.")

# ── Groq Client ─────────────────────────────────────────────────────────────
_groq = Groq(api_key=settings.GROQ_API_KEY)

# ── Constants ────────────────────────────────────────────────────────────────
CHITCHAT_PATTERNS = re.compile(
    r"^(hi|hello|hey|hlo|howdy|namaste|sup|yo|"
    r"good\s*(morning|evening|afternoon|night)|"
    r"how are you|how('s| is) it going|what('s| is) up|how('s| is) your day|"
    r"who are you|what('s| is) your name|tell me about yourself|"
    r"thank(s| you)|bye|goodbye|see you|take care|good night|"
    r"ok|okay|great|nice|cool|awesome|amazing|perfect|wonderful|fantastic|"
    r"help|can you help|i need help|"
    r"what can you do|what do you do|"
    r"how('s| is) life|i('m| am) bored|lol|haha|hehe|"
    r"tell me a joke|joke|funny|"
    r"i('m| am) (good|fine|great|okay|doing well)|"
    r"nothing much|not much|nm|same here|"
    r"you('re| are) (great|awesome|cool|nice|helpful)|"
    r"miss you|love you|hate you)[\s!?.]*$",
    re.IGNORECASE,
)

CHITCHAT_SYSTEM = (
    "You are QuikrBot, a friendly and fun assistant for the QuikrClone classified ads platform. "
    "The user is having a casual conversation with you. Respond naturally and warmly like a friendly human would. "
    "If the user greets you, greet back warmly. If they make small talk, engage naturally. "
    "If they joke, be playful. If they say bye, wish them well. "
    "If they ask who you are, say you are QuikrBot, the smart AI assistant for QuikrClone. "
    "Keep your responses short (1-3 sentences), warm, and conversational. "
    "Do NOT try to push platform features unless the user asks. "
    "Do NOT make up information about products or prices."
)

RAG_SYSTEM = (
    "You are QuikrBot, a friendly assistant for the QuikrClone classified ads marketplace.\n\n"
    "RULES:\n"
    "1. If the user's message is casual chitchat (greetings, jokes, small talk, emotions), respond warmly and naturally in 1-2 sentences.\n"
    "2. If the user asks about the QuikrClone platform, answer ONLY using the context provided below. Do not make up information.\n"
    "3. If the answer is NOT found in the context below, say: "
    "'I'm sorry, I don't have information about that. I can only help with QuikrClone platform questions like posting ads, searching, chatting with sellers, and more!'\n"
    "4. If the user asks about anything OUTSIDE the platform (coding, science, math, general knowledge, etc.), "
    "politely refuse by saying: 'I appreciate the question, but I'm QuikrBot — I can only help with QuikrClone platform topics! "
    "Try asking me about posting ads, searching products, chatting with sellers, or managing your account. 😊'\n"
    "5. NEVER answer questions unrelated to QuikrClone. Stay strictly within your scope."
)


# ── Chunking Helper ─────────────────────────────────────────────────────────
def _chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
    """Splits document text into overlapping chunks for embedding."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


# ── Static FAQ Answers ──────────────────────────────────────────────────────
# These are checked first (no LLM/RAG needed) for fast, reliable answers.
STATIC_FAQ = [
    {
        "keywords": ["how to search", "search for", "find product", "search product", "search bar", "how to find"],
        "answer": (
            "**How to Search for Products** 🔍\n\n"
            "1. Use the **search bar** at the top of every page.\n"
            "2. Type what you're looking for (e.g., \"iPhone\", \"sofa\", \"Honda City\").\n"
            "3. Press **Enter** to see matching results.\n\n"
            "The search checks ad titles, descriptions, and category names. "
            "You can further filter results by **price range**, **condition**, **category**, and more using the filters panel on the left!"
        ),
    },
    {
        "keywords": ["how to post", "post ad", "post an ad", "create ad", "sell something", "list item", "publish ad"],
        "answer": (
            "**How to Post a Free Ad** 📝\n\n"
            "1. Click the orange **\"Post Free Ad\"** button in the top navigation bar.\n"
            "2. Fill in the details:\n"
            "   • **Title** — A clear, short name for your item.\n"
            "   • **Category** — Select the best matching category.\n"
            "   • **Price** — Enter the price in ₹ (tick \"Negotiable\" if open to offers).\n"
            "   • **Photos** — Upload up to 5 images (first photo becomes the cover).\n"
            "   • **Location** — Select your state, city, and locality.\n"
            "3. Click **\"Publish Your Ad Now\"** — your ad will be live instantly!\n\n"
            "**Note:** You must be logged in to post an ad."
        ),
    },
    {
        "keywords": ["chat with seller", "contact seller", "message seller", "talk to seller", "how to chat"],
        "answer": (
            "**How to Chat with a Seller** 💬\n\n"
            "1. Open any ad you're interested in by clicking on it.\n"
            "2. On the Ad Details page, look at the **Seller Details** panel on the right.\n"
            "3. Click **\"Chat with Seller\"** — a private chat room will be created.\n"
            "4. You'll be taken to the Messages page where you can type and send messages in real time.\n\n"
            "**Alternative:** Click **\"Show Phone Number\"** to call or WhatsApp the seller directly.\n\n"
            "**Note:** You must be logged in to chat or view phone numbers."
        ),
    },
    {
        "keywords": ["register", "sign up", "create account", "new account", "how to join"],
        "answer": (
            "**How to Create an Account** 📋\n\n"
            "1. Click the **\"Sign Up\"** button in the top-right corner.\n"
            "2. Enter your **Full Name**, **Email**, and **Password**.\n"
            "3. Click **\"Create Account\"** — you'll be logged in automatically!\n\n"
            "With an account you can post ads, chat with sellers, and save favorites."
        ),
    },
    {
        "keywords": ["login", "log in", "sign in", "how to login"],
        "answer": (
            "**How to Log In** 🔑\n\n"
            "1. Click **\"Log In\"** in the top-right corner.\n"
            "2. Enter your **Email** and **Password**.\n"
            "3. Click **\"Sign In\"** — you're in!\n\n"
            "Forgot your password? Password reset is coming soon. Please contact support in the meantime."
        ),
    },
    {
        "keywords": ["favorite", "favourites", "wishlist", "save ad", "saved ads", "heart"],
        "answer": (
            "**How to Save Ads to Favorites** ❤️\n\n"
            "1. On any ad card, click the **heart icon** (❤️) in the top-right corner.\n"
            "2. The heart turns red — the ad is saved!\n"
            "3. To view your saved ads, click **❤️** in the top navigation bar or go to your profile dropdown → **\"My Favorites\"**.\n\n"
            "**Note:** You must be logged in to save favorites."
        ),
    },
    {
        "keywords": ["edit ad", "update ad", "change ad", "modify ad", "edit my ad"],
        "answer": (
            "**How to Edit Your Ad** ✏️\n\n"
            "1. Go to your profile dropdown → **\"My Ads\"**.\n"
            "2. Find the ad you want to edit and click **\"Edit\"**.\n"
            "3. Update the title, description, price, photos, or any other details.\n"
            "4. Click **\"Update Ad\"** to save your changes.\n\n"
            "You can also add or remove photos during editing!"
        ),
    },
    {
        "keywords": ["delete ad", "remove ad", "delete my ad"],
        "answer": (
            "**How to Delete Your Ad** 🗑️\n\n"
            "1. Go to your profile dropdown → **\"My Ads\"**.\n"
            "2. Find the ad you want to delete.\n"
            "3. Click the **delete/remove** option.\n"
            "4. Your ad will be removed from the platform."
        ),
    },
    {
        "keywords": ["filter", "sort", "refine", "price range", "price filter"],
        "answer": (
            "**How to Filter Search Results** 🎯\n\n"
            "On the Search Results page, use the **Filters panel** on the left:\n"
            "• **Sort By:** Newest, Price Low→High, Price High→Low, Most Popular.\n"
            "• **Category:** Select a specific category.\n"
            "• **Price Range:** Set min/max price or use quick presets (Under ₹5K, ₹5K–25K, etc.).\n"
            "• **Condition:** Brand New, Like New, Used.\n"
            "• **Listing Type:** Sell or Rent.\n\n"
            "Click **\"Clear\"** to remove all filters at once."
        ),
    },
    {
        "keywords": ["profile", "update profile", "change name", "change avatar", "upload photo"],
        "answer": (
            "**How to Manage Your Profile** 👤\n\n"
            "1. Click your **name/avatar** in the top-right corner.\n"
            "2. Select **\"My Profile\"**.\n"
            "3. You can update your **Full Name**, **Username**, **Email**, and **Phone Number**.\n"
            "4. Upload a **profile photo** or choose a fun **cartoon avatar**.\n"
            "5. Click **\"Save Changes\"** to apply."
        ),
    },
    {
        "keywords": ["report", "report ad", "suspicious", "scam", "fraud", "flag"],
        "answer": (
            "**How to Report a Suspicious Ad** 🚩\n\n"
            "1. Open the ad you want to report.\n"
            "2. Scroll to the bottom of the right sidebar.\n"
            "3. Click **\"Report this ad\"**.\n"
            "4. Select a reason and submit your report.\n\n"
            "Our admin team will review the report and take action."
        ),
    },
    {
        "keywords": ["log out", "logout", "sign out", "signout"],
        "answer": (
            "**How to Log Out** 🚪\n\n"
            "1. Click your **name/avatar** in the top-right corner.\n"
            "2. Click the red **\"Sign Out\"** button at the bottom of the dropdown.\n"
            "3. You'll be logged out immediately.\n\n"
            "For security, your session also expires when you close your browser."
        ),
    },
    {
        "keywords": ["is it free", "cost", "price to post", "any charges", "free to use"],
        "answer": (
            "**Yes, QuikrClone is completely free!** 🎉\n\n"
            "• Posting ads is **free** — no charges.\n"
            "• Browsing and searching is **free**.\n"
            "• Chatting with sellers is **free**.\n"
            "• Creating an account is **free**.\n\n"
            "There are no hidden fees!"
        ),
    },
    {
        "keywords": ["category", "categories", "what categories", "available categories"],
        "answer": (
            "**Available Categories** 📂\n\n"
            "QuikrClone has the following categories:\n"
            "• 📱 Mobiles & Tablets\n"
            "• 🚗 Cars & Bikes\n"
            "• 💻 Electronics\n"
            "• 🏠 Real Estate\n\n"
            "Click on any category on the Home Page to browse all ads in that category."
        ),
    },
    {
        "keywords": ["safety", "safety tips", "safe buying", "precaution"],
        "answer": (
            "**Safety Tips for Buyers** 🛡️\n\n"
            "• Always meet the seller in a **public place** (mall, café).\n"
            "• **Inspect the item thoroughly** before paying.\n"
            "• Pay only **after you physically receive** the item.\n"
            "• Never pay in advance via UPI/bank transfer without seeing the item.\n"
            "• If a deal seems **too good to be true**, it probably is.\n"
            "• Don't share your bank OTP with anyone.\n"
            "• Use the **in-app chat** to keep communication records safe."
        ),
    },
    {
        "keywords": ["notification", "notifications", "alerts", "search alert", "notify me"],
        "answer": (
            "**Notifications & Search Alerts** 🔔\n\n"
            "• You get notified when someone messages you, when a favorited ad's price drops, or when its status changes.\n"
            "• Click the **🔔 bell icon** in the top navigation to see all notifications.\n"
            "• You can also set up **Search Alerts** from your profile dropdown → **\"Search Alerts\"** to get notified when new ads matching your criteria are posted."
        ),
    },
]


def _find_static_answer(message: str) -> Optional[str]:
    """
    Checks the user message against the static FAQ keyword list.
    Returns the answer string if a match is found, else None.
    """
    msg_lower = message.lower()
    for faq in STATIC_FAQ:
        for keyword in faq["keywords"]:
            if keyword in msg_lower:
                return faq["answer"]
    return None


def _find_db_faq(db: Session, message: str) -> Optional[str]:
    """
    Checks active FAQs from the database.
    Matches if:
      1. The FAQ question is found in the message (or vice versa), OR
      2. Any keyword (comma-separated, or space-separated fallback) is found in the message.
    """
    msg_lower = message.lower().strip()
    try:
        faqs = db.query(FAQ).filter(FAQ.is_active == True, FAQ.is_delete.isnot(True)).all()
        for faq in faqs:
            q_lower = faq.question.lower().strip()

            # Match 1: Question substring match (bidirectional)
            if q_lower in msg_lower or msg_lower in q_lower:
                return faq.answer

            # Match 2: Keyword match (comma-separated)
            raw_keywords = faq.keywords or ""
            if "," in raw_keywords:
                keywords = [kw.strip().lower() for kw in raw_keywords.split(",") if kw.strip()]
            else:
                # Fallback: treat space-separated words as individual keywords
                keywords = [kw.strip().lower() for kw in raw_keywords.split() if kw.strip()]

            for kw in keywords:
                if kw in msg_lower:
                    return faq.answer
    except Exception as e:
        _logger.error("Error checking DB FAQs: %s", e)
    return None


# ── Public CRUD Methods ──────────────────────────────────────────────────────

def index_document(db: Session, doc_id: str, text_content: str, metadata: dict = None) -> int:
    """
    Chunks and indexes a document into PostgreSQL via pgvector.
    Returns the number of chunks stored.
    """
    chunks = _chunk_text(text_content)
    if not chunks:
        return 0

    # Delete existing chunks for this doc_id to allow re-indexing
    db.query(KnowledgeChunk).filter(KnowledgeChunk.doc_id == doc_id).delete()
    db.commit()

    # Generate embeddings for all chunks in one batch (fast)
    embeddings = _embed_model.encode(chunks, show_progress_bar=False)

    for i, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        record = KnowledgeChunk(
            doc_id=doc_id,
            chunk_index=i,
            content=chunk,
            filename=(metadata or {}).get("filename"),
            embedding=emb.tolist(),
        )
        db.add(record)

    db.commit()
    _logger.info("Indexed %d chunks for doc_id=%s into pgvector", len(chunks), doc_id)
    return len(chunks)


def retrieve_context(db: Session, question: str, n_results: int = 5) -> str:
    """
    Retrieves top-K relevant chunks from pgvector for the given question.
    Uses cosine distance operator (<=>).
    Returns a formatted string of context.
    """
    _logger.info("Retrieving context for question: %s", question)

    total = db.query(KnowledgeChunk).count()
    if total == 0:
        _logger.info("No knowledge chunks in database.")
        return ""

    # Embed the question
    q_embedding = _embed_model.encode(question).tolist()

    # pgvector cosine distance query
    results = (
        db.query(KnowledgeChunk.content)
        .order_by(KnowledgeChunk.embedding.cosine_distance(q_embedding))
        .limit(min(n_results, total))
        .all()
    )

    chunks = [r.content for r in results]
    _logger.info("Found %d relevant chunks via pgvector.", len(chunks))
    return "\n\n---\n\n".join(chunks)


def ask(db: Session, message: str) -> dict:
    """
    Main entry point. Handles static FAQ, chitchat, and RAG questions.

    Flow:
      1. Static FAQ keyword match → instant answer (no API call)
      2. Chitchat regex match → short Groq LLM call
      3. RAG retrieval → full Groq LLM call with context

    Returns { answer: str, source: str }
    """
    _logger.info("Chatbot 'ask' called with message: %s", message)
    message = message.strip()

    # 1. Database FAQ — admin-managed, checked first
    db_faq_answer = _find_db_faq(db, message)
    if db_faq_answer:
        _logger.info("DB FAQ match found for: %s", message)
        return {"answer": db_faq_answer, "source": "faq"}

    # 2. Static FAQ — instant, no API call needed
    static_answer = _find_static_answer(message)
    if static_answer:
        _logger.info("Static FAQ match found for: %s", message)
        return {"answer": static_answer, "source": "static"}

    # 2. Chitchat shortcut — no vector retrieval needed
    if CHITCHAT_PATTERNS.match(message):
        try:
            response = _groq.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": CHITCHAT_SYSTEM},
                    {"role": "user", "content": message},
                ],
                max_tokens=200,
                temperature=0.8,
            )
            return {"answer": response.choices[0].message.content, "source": "chitchat"}
        except Exception as e:
            _logger.error("Groq chitchat error: %s", e)
            return {"answer": "Hello! 👋 I'm QuikrBot. How can I help you today?", "source": "chitchat"}

    # 3. RAG — retrieve relevant context from pgvector, then generate via Groq
    context = retrieve_context(db, message)

    if not context:
        # No docs indexed yet — still try LLM with system prompt
        prompt_messages = [
            {"role": "system", "content": CHITCHAT_SYSTEM},
            {"role": "user", "content": message},
        ]
        source = "fallback"
    else:
        prompt_messages = [
            {"role": "system", "content": RAG_SYSTEM},
            {
                "role": "user",
                "content": (
                    f"Context from QuikrClone knowledge base:\n\n{context}\n\n"
                    f"---\n\nUser question: {message}"
                ),
            },
        ]
        source = "rag"

    try:
        response = _groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=prompt_messages,
            max_tokens=500,
            temperature=0.3,
        )
        answer = response.choices[0].message.content
    except Exception as e:
        _logger.error("Groq RAG error: %s", e)
        answer = (
            "I'm having trouble connecting to my knowledge base right now. "
            "Please try again in a moment, or browse the platform directly!"
        )
        source = "fallback"

    return {"answer": answer, "source": source}


def delete_document(db: Session, doc_id: str) -> bool:
    """Removes all chunks belonging to a specific document from pgvector."""
    try:
        count = db.query(KnowledgeChunk).filter(KnowledgeChunk.doc_id == doc_id).delete()
        db.commit()
        return count > 0
    except Exception as e:
        db.rollback()
        _logger.error("Error deleting doc %s: %s", doc_id, e)
        return False


def list_documents(db: Session) -> list:
    """Returns a deduplicated list of indexed doc_ids."""
    try:
        results = db.query(KnowledgeChunk.doc_id).distinct().all()
        return [r.doc_id for r in results]
    except Exception:
        return []


# ── FAQ CRUD Methods ─────────────────────────────────────────────────────────

def create_faq(db: Session, question: str, keywords: str, answer: str) -> dict:
    """Creates a new FAQ entry."""
    try:
        faq = FAQ(question=question, keywords=keywords, answer=answer, is_active=True)
        db.add(faq)
        db.commit()
        db.refresh(faq)
        return {"success": True, "msg": "FAQ created.", "data": _faq_to_dict(faq)}
    except Exception as e:
        db.rollback()
        _logger.error("Error creating FAQ: %s", e)
        return {"success": False, "msg": "Database error."}


def list_faqs(db: Session) -> list:
    """Returns all active FAQs."""
    try:
        faqs = db.query(FAQ).filter(FAQ.is_delete.isnot(True)).order_by(FAQ.created_at.desc()).all()
        return [_faq_to_dict(f) for f in faqs]
    except Exception:
        return []


def update_faq(db: Session, faq_id: int, data: dict) -> dict:
    """Updates an existing FAQ."""
    try:
        faq = db.query(FAQ).filter(FAQ.id == faq_id, FAQ.is_delete.isnot(True)).first()
        if not faq:
            return {"success": False, "msg": "FAQ not found."}
        for key, val in data.items():
            if val is not None and hasattr(faq, key):
                setattr(faq, key, val)
        db.commit()
        db.refresh(faq)
        return {"success": True, "msg": "FAQ updated.", "data": _faq_to_dict(faq)}
    except Exception as e:
        db.rollback()
        _logger.error("Error updating FAQ: %s", e)
        return {"success": False, "msg": "Database error."}


def delete_faq(db: Session, faq_id: int) -> dict:
    """Soft-deletes a FAQ."""
    try:
        faq = db.query(FAQ).filter(FAQ.id == faq_id, FAQ.is_delete.isnot(True)).first()
        if not faq:
            return {"success": False, "msg": "FAQ not found."}
        faq.is_delete = True
        db.commit()
        return {"success": True, "msg": "FAQ deleted."}
    except Exception as e:
        db.rollback()
        _logger.error("Error deleting FAQ: %s", e)
        return {"success": False, "msg": "Database error."}


def _faq_to_dict(faq: FAQ) -> dict:
    return {
        "id": faq.id,
        "question": faq.question,
        "keywords": faq.keywords,
        "answer": faq.answer,
        "is_active": faq.is_active,
        "created_at": str(faq.created_at) if faq.created_at else None,
    }
