# QuikrClone — Tech Stack & Environment Setup

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend Framework** | FastAPI | ≥0.135 |
| **Backend Language** | Python | ≥3.12 |
| **ORM** | SQLAlchemy | ≥2.0 |
| **Migrations** | Alembic | ≥1.18 |
| **Database** | PostgreSQL | 14+ |
| **Vector Store** | pgvector (PostgreSQL extension) | ≥0.4 |
| **Frontend Framework** | React | 19 |
| **Build Tool** | Vite | 8 |
| **CSS Framework** | Tailwind CSS | 3.4 |
| **Icons** | Lucide React | ≥1.11 |
| **Routing** | React Router DOM | v7 |
| **HTTP Client** | Axios | ≥1.15 |
| **Date Utils** | date-fns | ≥4.1 |
| **Auth** | JWT (python-jose) + bcrypt | — |
| **Real-time** | WebSocket (FastAPI native) | — |
| **LLM** | Groq API (Llama 3.3 70B) | — |
| **Embeddings** | sentence-transformers (all-MiniLM-L6-v2) | ≥5.0 |
| **PDF Parsing** | pdfminer.six | — |
| **Rate Limiting** | slowapi | ≥0.1.9 |
| **Email** | smtplib (Gmail SMTP, STARTTLS on port 587) | — |
| **Package Manager (Backend)** | uv | latest |
| **Package Manager (Frontend)** | npm | latest |

---

## Backend Dependencies (pyproject.toml)

```toml
[project]
name = "fastapi-template"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "alembic>=1.18.4",
    "bcrypt>=5.0.0",
    "fastapi>=0.135.1",
    "psycopg2-binary>=2.9.11",
    "pydantic-settings>=2.13.1",
    "pydantic[email]>=2.12.5",
    "python-jose>=3.5.0",
    "sqlalchemy>=2.0.48",
    "uvicorn>=0.41.0",
    "python-dotenv>=1.0.1",
    "python-multipart>=0.0.22",
    "slowapi>=0.1.9",
    "httpx>=0.28.1",
    "itsdangerous>=2.2.0",
    "pgvector>=0.4.0",
    "sentence-transformers>=5.0.0",
    "groq>=1.2.0",
    "pdfminer-six>=20260107",
]
```

---

## Frontend Dependencies (package.json)

```json
{
  "dependencies": {
    "axios": "^1.15.2",
    "date-fns": "^4.1.0",
    "lucide-react": "^1.11.0",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-router-dom": "^7.14.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.5.0",
    "postcss": "^8.5.12",
    "tailwindcss": "^3.4.19",
    "vite": "^8.0.10"
  }
}
```

---

## Environment Variables (.env)

Place `.env` in the **project root** (NOT inside backend/ or frontend/).

```env
# PostgreSQL
PG_USER=postgres
PG_PASSWORD=your_password
PG_DBNAME=quikr_db
PG_HOSTNAME=localhost

# JWT
JWT_SECRET_KEY=your-very-long-random-secret-key-here

# Groq LLM
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM_NAME=QuikrClone
FRONTEND_URL=http://localhost:3000
```

> **Important:** The backend's `config.py` loads `.env` from `../.env` (one level up from `backend/`).

---

## Quick Start Commands

```bash
# Backend
cd backend
uv venv && source .venv/bin/activate
uv pip install -e .
alembic upgrade head
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

---

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Backend API | 8000 | http://localhost:8000 |
| Frontend Dev | 3000 | http://localhost:3000 |
| Swagger Docs | 8000 | http://localhost:8000/docs |
| Health Check | 8000 | http://localhost:8000/health |

The frontend Vite dev server proxies `/api` requests to the backend at port 8000 (configured in `vite.config.js`).

---

## Database Setup

```bash
# 1. Install pgvector extension
sudo apt install postgresql-14-pgvector  # or appropriate version

# 2. Create database
createdb quikr_db

# 3. Enable pgvector
psql -d quikr_db -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 4. Run migrations
cd backend && alembic upgrade head

# 5. Create admin user
python create_admin.py

# 6. Seed initial data (categories, locations, attributes)
python seed.py
python seed_category_attributes.py
```
