# CLAUDE.md - QuikrClone Project Guide

This guide provides essential commands and context for working on the QuikrClone project.

## Build and Development Commands

### Backend (FastAPI)
- **Start Server**: `uvicorn main:app --reload --port 8000`
- **Database Migrations**: `alembic upgrade head`
- **Create Migration**: `alembic revision --autogenerate -m "description"`
- **Seed Data**: `python seed.py` or `.venv/bin/python seed.py`
- **Dependencies**: Uses `pip` or `uv` (managed in `.venv`)

### Frontend (React + Vite)
- **Install Dependencies**: `cd frontend && npm install`
- **Start Dev Server**: `cd frontend && npm run dev`
- **Build Production**: `cd frontend && npm run build`
- **Lint**: `cd frontend && npm run lint`

## Project Architecture

### Backend Structure (`app/`)
- **`core/`**: Security (JWT), config, and constants.
- **`db/`**: Session management and base models.
- **`modules/`**: Modular domain logic (Users, Ads, Locations, etc.).
  - Each module follows the pattern: `model.py`, `schema.py`, `crud.py`, `endpoint.py`.

### Frontend Structure (`frontend/src/`)
- **`components/`**: Reusable UI components (Navbar, Footer, Login, etc.).
- **`AuthContext.jsx`**: Global authentication state.
- **`api.js`**: Axios instance with JWT interceptors.

## Code Style Guidelines
- **Python**: Follow PEP 8. Use type hints for all function signatures. Use standard response format: `{"success": bool, "msg": str, "data": any}`.
- **JavaScript/React**: Use Functional Components and Hooks. Use Tailwind CSS for styling. Use Lucide React for icons.
- **Naming**: 
  - Python: `snake_case` for functions/variables, `PascalCase` for classes.
  - JS: `camelCase` for variables, `PascalCase` for Components.

## Authentication Flow
1. User logs in via `/api/v1/users/login/`.
2. Backend returns JWT `access_token`.
3. Frontend stores token in `localStorage`.
4. Axios interceptor attaches `Authorization: Bearer <token>` to all subsequent requests.
