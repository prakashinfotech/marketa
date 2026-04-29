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

    # ── App Settings ─────────────────────────────────────────────────────────
    APP_NAME: str = "FastAPI Template"
    DEBUG: bool = False

    # ── Add new settings below this line ─────────────────────────────────────
    # REDIS_URL: str = "redis://localhost:6379/0"
    # SMTP_HOST: str | None = None

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")


settings = Settings()
