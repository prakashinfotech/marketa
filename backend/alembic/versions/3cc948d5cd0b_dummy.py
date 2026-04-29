"""dummy

Revision ID: 3cc948d5cd0b
Revises: 796c992decfc
Create Date: 2026-04-28 17:07:09.302078

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '3cc948d5cd0b'
down_revision: Union[str, None] = '796c992decfc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    pass

def downgrade() -> None:
    pass
