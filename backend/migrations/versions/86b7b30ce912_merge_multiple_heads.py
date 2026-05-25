"""merge multiple heads

Revision ID: 86b7b30ce912
Revises: 20260515_add_audit_indexes, 20260515_create_audit_logs, 4533fbc9f2e9, 6a084af89115, add_marketplace_table
Create Date: 2026-05-17 20:23:02.883280

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '86b7b30ce912'
down_revision: Union[str, None] = ('20260515_add_audit_indexes', '20260515_create_audit_logs', '4533fbc9f2e9', '6a084af89115', 'add_marketplace_table')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
