"""create audit_logs table

Revision ID: 20260515_create_audit_logs
Revises: a9f3d1c4b2e4
Create Date: 2026-05-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260515_create_audit_logs'
down_revision: Union[str, Sequence[str], None] = 'a9f3d1c4b2e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('usuario_id', sa.Integer(), nullable=True),
        sa.Column('nombre_usuario', sa.String(length=150), nullable=True),
        sa.Column('rol_usuario', sa.String(length=50), nullable=True),
        sa.Column('accion', sa.String(length=100), nullable=False),
        sa.Column('modulo', sa.String(length=100), nullable=True),
        sa.Column('entidad_afectada', sa.String(length=100), nullable=True),
        sa.Column('entidad_id', sa.String(length=100), nullable=True),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('metodo_http', sa.String(length=10), nullable=True),
        sa.Column('endpoint', sa.String(length=255), nullable=True),
        sa.Column('ip', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('datos_anteriores', sa.Text(), nullable=True),
        sa.Column('datos_nuevos', sa.Text(), nullable=True),
        sa.Column('estado_evento', sa.String(length=50), nullable=True),
        sa.Column('fecha', sa.DateTime(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('audit_logs')
