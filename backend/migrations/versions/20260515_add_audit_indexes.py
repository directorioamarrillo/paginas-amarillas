"""add indexes for audit_logs for performance

Revision ID: 20260515_add_audit_indexes
Revises: 
Create Date: 2026-05-15 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260515_add_audit_indexes'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_index('ix_audit_logs_timestamp', 'audit_logs', ['timestamp'])
    op.create_index('ix_audit_logs_entidad_afectada', 'audit_logs', ['entidad_afectada'])
    op.create_index('ix_audit_logs_entidad_id', 'audit_logs', ['entidad_id'])
    op.create_index('ix_audit_logs_rol_usuario', 'audit_logs', ['rol_usuario'])


def downgrade():
    op.drop_index('ix_audit_logs_rol_usuario', table_name='audit_logs')
    op.drop_index('ix_audit_logs_entidad_id', table_name='audit_logs')
    op.drop_index('ix_audit_logs_entidad_afectada', table_name='audit_logs')
    op.drop_index('ix_audit_logs_timestamp', table_name='audit_logs')
