"""
Configuration management for the application.
Uses pydantic-settings to load environment variables from .env file.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings and environment variable mapping.
    Add new env vars here as fields — they are auto-loaded from .env.
    """

    # ── PostgreSQL ───────────────────────────────────────────────────────────
    PG_USER: str
    PG_PASSWORD: str
    PG_DBNAME: str
    PG_HOSTNAME: str = "localhost"

    @property
    def DATABASE_URL(self) -> str:
        """ Constructs the SQLAlchemy database connection string. """
        return f"postgresql://{self.PG_USER}:{self.PG_PASSWORD}@{self.PG_HOSTNAME}/{self.PG_DBNAME}"

    # ── JWT Authentication ───────────────────────────────────────────────────
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── Groq LLM ─────────────────────────────────────────────────────────────
    GROQ_API_KEY: str = ""

    # ── App Settings ─────────────────────────────────────────────────────────
    APP_NAME: str = "FastAPI Template"
    DEBUG: bool = False

    # ── Email Settings ───────────────────────────────────────────────────────
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str = "noreply@quikrclone.com"
    SMTP_FROM_NAME: str = "QuikrClone"
    FRONTEND_URL: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

settings = Settings()
