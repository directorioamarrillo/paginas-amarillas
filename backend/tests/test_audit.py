import pytest
import asyncio

from app.services.audit_service import registrar_auditoria


class FakeSession:
    def __init__(self, fail_commit: bool = False):
        self.fail_commit = fail_commit
        self.added = []
        self.committed = False
        self.rolled_back = False

    def add(self, obj):
        self.added.append(obj)

    async def commit(self):
        if self.fail_commit:
            raise Exception("commit failed")
        self.committed = True

    async def rollback(self):
        self.rolled_back = True

    async def refresh(self, obj):
        # Simula que la BD dejó un id
        setattr(obj, "id", 123)
        return obj


def test_registrar_auditoria_serializa_y_retorna():
    async def run_test():
        db = FakeSession()
        registro = await registrar_auditoria(
            db,
            usuario_id=5,
            nombre_usuario="test@example.com",
            rol_usuario="ADMIN",
            accion="test_accion",
            modulo="tests",
            entidad_afectada="test",
            entidad_id="42",
            descripcion="desc",
            metodo_http="POST",
            endpoint="/tests",
            datos_anteriores={"a": 1},
            datos_nuevos=[1, 2],
        )

        assert getattr(registro, "id", None) == 123
        assert registro.usuario_id == 5
        assert registro.accion == "test_accion"
        assert registro.modulo == "tests"
        assert registro.datos_anteriores is not None
        assert registro.datos_nuevos is not None

    asyncio.run(run_test())


def test_registrar_auditoria_rolls_back_on_commit_error():
    async def run_test():
        db = FakeSession(fail_commit=True)
        with pytest.raises(Exception):
            await registrar_auditoria(db, accion="x", modulo="tests")
        assert db.rolled_back

    asyncio.run(run_test())
