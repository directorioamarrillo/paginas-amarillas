from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import AuditLog
from datetime import datetime
import json


async def registrar_auditoria(db: AsyncSession, *, usuario_id: int | None = None, nombre_usuario: str | None = None,
                              rol_usuario: str | None = None, accion: str, modulo: str | None = None,
                              entidad_afectada: str | None = None, entidad_id: str | None = None,
                              descripcion: str | None = None, metodo_http: str | None = None,
                              endpoint: str | None = None, ip: str | None = None, user_agent: str | None = None,
                              datos_anteriores = None, datos_nuevos = None, estado_evento: str | None = None):
    """Crea un registro de auditoría en la tabla `audit_logs`. Los campos `datos_anteriores` y
    `datos_nuevos` se serializan como JSON si son dict/list.
    """
    def _serialize(value):
        if value is None:
            return None
        if isinstance(value, (dict, list)):
            try:
                return json.dumps(value, ensure_ascii=False)
            except Exception:
                return str(value)
        return str(value)

    registro = AuditLog(
        usuario_id=usuario_id,
        nombre_usuario=nombre_usuario,
        rol_usuario=rol_usuario,
        accion=accion,
        modulo=modulo,
        entidad_afectada=entidad_afectada,
        entidad_id=entidad_id,
        descripcion=descripcion,
        metodo_http=metodo_http,
        endpoint=endpoint,
        ip=ip,
        user_agent=user_agent,
        datos_anteriores=_serialize(datos_anteriores),
        datos_nuevos=_serialize(datos_nuevos),
        estado_evento=estado_evento,
        fecha=datetime.utcnow(),
        timestamp=datetime.utcnow(),
    )
    db.add(registro)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    await db.refresh(registro)
    return registro


async def registrar_auditoria_batch(db: AsyncSession, items: list[dict]):
    """Inserta múltiples registros de auditoría en una sola transacción (batch).
    `items` es una lista de diccionarios con las mismas claves aceptadas por
    `registrar_auditoria` excepto que no deben incluir `fecha`/`timestamp`.
    """
    def _serialize(value):
        if value is None:
            return None
        if isinstance(value, (dict, list)):
            try:
                return json.dumps(value, ensure_ascii=False)
            except Exception:
                return str(value)
        return str(value)

    registros = []
    for item in items:
        reg = AuditLog(
            usuario_id=item.get('usuario_id'),
            nombre_usuario=item.get('nombre_usuario'),
            rol_usuario=item.get('rol_usuario'),
            accion=item.get('accion'),
            modulo=item.get('modulo'),
            entidad_afectada=item.get('entidad_afectada'),
            entidad_id=item.get('entidad_id'),
            descripcion=item.get('descripcion'),
            metodo_http=item.get('metodo_http'),
            endpoint=item.get('endpoint'),
            ip=item.get('ip'),
            user_agent=item.get('user_agent'),
            datos_anteriores=_serialize(item.get('datos_anteriores')),
            datos_nuevos=_serialize(item.get('datos_nuevos')),
            estado_evento=item.get('estado_evento'),
            fecha=datetime.utcnow(),
            timestamp=datetime.utcnow(),
        )
        registros.append(reg)

    db.add_all(registros)
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    # No hacemos refresh de cada registro por eficiencia
    return registros
