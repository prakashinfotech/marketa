"""
Alembic environment configuration.
Loads database URL from app settings and registers all models for auto-migration.

When you add a new module with a model, import it here:
    from app.modules.your_module import model as your_module_model
"""

from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (one level above backend/)
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

from app.core.config import settings
from app.db.session import Base

# Import ALL models here so Alembic can detect them
from app.modules.users import model as user_model  # noqa: F401
from app.modules.locations import model as location_model  # noqa: F401
from app.modules.categories import model as category_model  # noqa: F401
from app.modules.ads import model as ad_model  # noqa: F401
from app.modules.favorites import model as favorite_model  # noqa: F401
from app.modules.chat import model as chat_model  # noqa: F401
from app.modules.reviews import model as review_model  # noqa: F401
from app.modules.reports import model as report_model  # noqa: F401
from app.modules.search_alerts import model as search_alert_model  # noqa: F401
from app.modules.packages import model as package_model  # noqa: F401
from app.modules.notifications import model as notification_model  # Phase 5 # noqa: F401
from app.modules.contact import model as contact_model  # noqa: F401
from app.modules.chatbot import model as chatbot_model  # noqa: F401
from app.modules.recently_viewed import model as recently_viewed_model  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override sqlalchemy.url from settings
DATABASE_URL = settings.DATABASE_URL
config.set_main_option("sqlalchemy.url", DATABASE_URL)
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """ Run migrations in 'offline' mode. """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """ Run migrations in 'online' mode. """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
