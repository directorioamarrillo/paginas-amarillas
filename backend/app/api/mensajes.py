from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.db.conexion import get_db
from app.models.models import Mensaje, Marketplace
from app.schemas.schemas import MensajeCreate, MensajeResponse
from app.api.auth import can_view_deleted_records, require_permission, get_current_user, is_admin_user
from app.api.notificaciones import create_business_notification
from seeders.seed_permisos import Permisos
from app.services.audit_service import registrar_auditoria

router = APIRouter()


def _is_admin(user) -> bool:
    return is_admin_user(user)


def _assert_mensaje_owner_or_admin(user, mensaje: Mensaje) -> None:
    if _is_admin(user):
        return
    if mensaje.id_usuario_enviador_mensaje != user.id:
        raise HTTPException(status_code=403, detail="Solo el autor puede modificar este mensaje")


@router.post("/mensajes/", response_model=MensajeResponse, status_code=201)
async def create_mensaje(
    payload: MensajeCreate,
    current_user = Depends(require_permission(Permisos.CREAR_MENSAJES)),
    db: AsyncSession = Depends(get_db)
):
    if not _is_admin(current_user) and payload.id_usuario_enviador_mensaje != current_user.id:
        raise HTTPException(status_code=403, detail="No puedes crear mensajes en nombre de otro usuario")

    db_item = Mensaje(**payload.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)

    marketplace_result = await db.execute(
        select(Marketplace)
        .options(joinedload(Marketplace.empresa))
        .where(Marketplace.id == db_item.id_marketplace, Marketplace.deleted_at.is_(None))
    )
    marketplace = marketplace_result.scalars().first()

    vendedor_id = getattr(getattr(marketplace, "empresa", None), "id_usuario_creador", None)
    if vendedor_id and vendedor_id != db_item.id_usuario_enviador_mensaje:
        try:
            await create_business_notification(
                db,
                id_usuario_destinatario=vendedor_id,
                tipo="new_message",
                contenido=f"Tienes un nuevo mensaje sobre '{marketplace.nombre}'",
                id_usuario_remitente=db_item.id_usuario_enviador_mensaje,
            )
        except HTTPException:
            # No afecta la creación del mensaje si falla la notificación.
            pass
    try:
        await registrar_auditoria(db, usuario_id=db_item.id_usuario_enviador_mensaje, nombre_usuario=None, rol_usuario=None, accion='crear_mensaje', modulo='mensajes', entidad_afectada='mensaje', entidad_id=str(db_item.id), descripcion=f'Mensaje creado en marketplace {db_item.id_marketplace}', metodo_http='POST', endpoint='/mensajes/')
    except Exception:
        pass
    return db_item


@router.get("/mensajes/", response_model=list[MensajeResponse])
async def list_mensajes(
    skip: int = 0,
    limit: int = 50,
    id_marketplace: int | None = Query(default=None),
    id_usuario: int | None = Query(default=None),
    fecha_from: str | None = Query(default=None),
    fecha_to: str | None = Query(default=None),
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Mensaje).options(joinedload(Mensaje.usuario_enviador_mensaje))
    if not can_view_deleted:
        query = query.where(Mensaje.deleted_at.is_(None))
    if id_marketplace is not None:
        query = query.where(Mensaje.id_marketplace == id_marketplace)
    if id_usuario is not None:
        query = query.where(Mensaje.id_usuario_enviador_mensaje == id_usuario)
    # filtros por fechas (ISO)
    from datetime import datetime
    if fecha_from:
        try:
            dt_from = datetime.fromisoformat(fecha_from)
            query = query.where(Mensaje.fecha_hora >= dt_from)
        except Exception:
            pass
    if fecha_to:
        try:
            dt_to = datetime.fromisoformat(fecha_to)
            query = query.where(Mensaje.fecha_hora <= dt_to)
        except Exception:
            pass
    query = query.order_by(Mensaje.fecha_hora.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/mensajes/{mensaje_id}", response_model=MensajeResponse)
async def get_mensaje(
    mensaje_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Mensaje).where(Mensaje.id == mensaje_id).options(joinedload(Mensaje.usuario_enviador_mensaje))
    if not can_view_deleted:
        query = query.where(Mensaje.deleted_at.is_(None))
    result = await db.execute(query)
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    return db_item


@router.put("/mensajes/{mensaje_id}", response_model=MensajeResponse)
async def update_mensaje(
    mensaje_id: int,
    payload: MensajeCreate,
    current_user = Depends(require_permission(Permisos.MODIFICAR_MENSAJES)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Mensaje).where(Mensaje.id == mensaje_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    _assert_mensaje_owner_or_admin(current_user, db_item)

    if not _is_admin(current_user):
        # Evita que el autor cambie participantes/chat para escalar acceso por IDOR.
        if payload.id_usuario_enviador_mensaje != db_item.id_usuario_enviador_mensaje:
            raise HTTPException(status_code=403, detail="No puedes cambiar el remitente del mensaje")
        if payload.id_usuario_creador_chat != db_item.id_usuario_creador_chat:
            raise HTTPException(status_code=403, detail="No puedes cambiar el creador del chat")
        if payload.id_marketplace != db_item.id_marketplace:
            raise HTTPException(status_code=403, detail="No puedes mover el mensaje a otro marketplace")

    for key, value in payload.model_dump().items():
        setattr(db_item, key, value)

    await db.commit()
    await db.refresh(db_item)
    try:
        await registrar_auditoria(db, usuario_id=current_user.id if current_user else None, nombre_usuario=getattr(current_user,'correo',None) if current_user else None, rol_usuario=getattr(getattr(current_user,'rol_obj',None),'nombre',None) if current_user else None, accion='actualizar_mensaje', modulo='mensajes', entidad_afectada='mensaje', entidad_id=str(db_item.id), descripcion='Mensaje actualizado', metodo_http='PUT', endpoint=f'/mensajes/{mensaje_id}')
    except Exception:
        pass
    return db_item


@router.delete("/mensajes/{mensaje_id}")
async def delete_mensaje(
    mensaje_id: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Mensaje).where(Mensaje.id == mensaje_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    if not _is_admin(current_user) and db_item.id_usuario_enviador_mensaje != current_user.id:
        raise HTTPException(status_code=403, detail="Solo el autor puede eliminar este mensaje")

    db_item.deleted_at = datetime.utcnow()
    await db.commit()
    try:
        await registrar_auditoria(db, usuario_id=current_user.id if current_user else None, nombre_usuario=getattr(current_user,'correo',None) if current_user else None, rol_usuario=getattr(getattr(current_user,'rol_obj',None),'nombre',None) if current_user else None, accion='desactivar_mensaje', modulo='mensajes', entidad_afectada='mensaje', entidad_id=str(db_item.id), descripcion='Mensaje desactivado', metodo_http='DELETE', endpoint=f'/mensajes/{mensaje_id}')
    except Exception:
        pass
    return {"detail": "Mensaje desactivado"}


@router.patch("/mensajes/{mensaje_id}/restore")
async def restore_mensaje(
    mensaje_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Mensaje).where(Mensaje.id == mensaje_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")

    db_item.deleted_at = None
    await db.commit()
    return {"detail": "Mensaje restaurado"}
