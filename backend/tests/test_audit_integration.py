import asyncio
import json
from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

import app.services.audit_service as audit_service


Base = declarative_base()


class TestAuditLog(Base):
    __tablename__ = "audit_logs"
    id = sa.Column(sa.Integer, primary_key=True)
    usuario_id = sa.Column(sa.Integer, nullable=True)
    nombre_usuario = sa.Column(sa.String(150), nullable=True)
    rol_usuario = sa.Column(sa.String(50), nullable=True)
    accion = sa.Column(sa.String(100), nullable=False)
    modulo = sa.Column(sa.String(100), nullable=True)
    entidad_afectada = sa.Column(sa.String(100), nullable=True)
    entidad_id = sa.Column(sa.String(100), nullable=True)
    descripcion = sa.Column(sa.Text, nullable=True)
    metodo_http = sa.Column(sa.String(10), nullable=True)
    endpoint = sa.Column(sa.String(255), nullable=True)
    ip = sa.Column(sa.String(45), nullable=True)
    user_agent = sa.Column(sa.Text, nullable=True)
    estado_evento = sa.Column(sa.String(50), nullable=True)
    datos_anteriores = sa.Column(sa.Text, nullable=True)
    datos_nuevos = sa.Column(sa.Text, nullable=True)
    fecha = sa.Column(sa.DateTime, default=datetime.utcnow)
    timestamp = sa.Column(sa.DateTime, default=datetime.utcnow)


def test_integration_registrar_auditoria_sqlite_memory():
    async def run():
        engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

        # Patch audit_service.AuditLog to use our TestAuditLog bound to test Base
        audit_service.AuditLog = TestAuditLog

        async with async_session() as session:
            registro = await audit_service.registrar_auditoria(
                session,
                usuario_id=7,
                nombre_usuario="int@example.com",
                rol_usuario="TEST",
                accion="int_action",
                modulo="integration",
                entidad_afectada="test",
                entidad_id="100",
                descripcion="integration test",
                metodo_http="POST",
                endpoint="/tests/int",
                datos_anteriores={"x": 1},
                datos_nuevos={"x": 2},
            )

            # Query the table to ensure row exists
            result = await session.execute(sa.select(TestAuditLog).where(TestAuditLog.id == registro.id))
            row = result.scalars().first()
            assert row is not None
            assert row.accion == "int_action"
            assert row.usuario_id == 7

    asyncio.run(run())
