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
    APP_NAME: str = "Marketa"
    DEBUG: bool = False

    # Comma-separated list of allowed origins for CORS, e.g.
    # "http://localhost:3000,http://localhost:5173,https://marketa.example.com"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # ── File Uploads ─────────────────────────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 5
    ALLOWED_IMAGE_MIME_TYPES: str = "image/jpeg,image/png,image/webp,image/gif"

    # ── Email Settings ───────────────────────────────────────────────────────
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str = "noreply@marketa.com"
    SMTP_FROM_NAME: str = "Marketa"
    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def allowed_image_mime_types_set(self) -> set[str]:
        return {t.strip().lower() for t in self.ALLOWED_IMAGE_MIME_TYPES.split(",") if t.strip()}

    @property
    def max_upload_size_bytes(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

settings = Settings()
