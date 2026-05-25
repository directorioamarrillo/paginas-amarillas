from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.conexion import get_db
from app.models.models import Rol, Usuario
from app.schemas.schemas import UsuarioCreate, UsuarioResponse, UsuarioUpdate
from app.api.auth import can_view_deleted_records, require_permission, hash_password
from seeders.seed_permisos import Permisos
from app.services.audit_service import registrar_auditoria

router = APIRouter()



@router.post("/usuarios/", response_model=UsuarioResponse, status_code=201)
async def create_usuario(
    usuario: UsuarioCreate,
    current_user = Depends(require_permission(Permisos.CREAR_USUARIOS)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Usuario).where(Usuario.correo == usuario.correo))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Ya existe un usuario registrado con este correo electrónico")

    hashed = hash_password(usuario.password)
    data = {**usuario.model_dump(exclude={"password"}), "password": hashed}
    db_usuario = Usuario(**data)

    if usuario.id_rol:
        role_result = await db.execute(select(Rol).where(Rol.id == usuario.id_rol))
        role = role_result.scalars().first()
        if role:
            db_usuario.id_rol = role.id

    db.add(db_usuario)
    await db.commit()
    await db.refresh(db_usuario)
    try:
        await registrar_auditoria(db, usuario_id=current_user.id if current_user else None, nombre_usuario=getattr(current_user, 'correo', None), rol_usuario=getattr(current_user, 'rol_obj', None).nombre if getattr(current_user, 'rol_obj', None) else None, accion='crear_usuario', modulo='usuarios', entidad_afectada='usuario', entidad_id=str(db_usuario.id), descripcion=f'Usuario creado: {db_usuario.correo}', metodo_http='POST', endpoint='/usuarios/')
    except Exception:
        pass
    return db_usuario


@router.get("/usuarios/", response_model=list[UsuarioResponse])
async def read_usuarios(
    skip: int = 0,
    limit: int = 10,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Usuario)
    if not can_view_deleted:
        query = query.where(Usuario.deleted_at.is_(None))
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def read_usuario(
    usuario_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Usuario).where(Usuario.id == usuario_id)
    if not can_view_deleted:
        query = query.where(Usuario.deleted_at.is_(None))
    result = await db.execute(query)
    usuario = result.scalars().first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def update_usuario(
    usuario_id: int,
    usuario: UsuarioUpdate,
    current_user = Depends(require_permission(Permisos.MODIFICAR_USUARIOS)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    db_usuario = result.scalars().first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = usuario.model_dump(exclude_unset=True)
    if "id_rol" in update_data:
        new_id_rol = update_data.pop("id_rol")
        if new_id_rol is not None:
            role_result = await db.execute(select(Rol).where(Rol.id == new_id_rol))
            role = role_result.scalars().first()
            if role:
                db_usuario.id_rol = role.id

    for key, value in update_data.items():
        setattr(db_usuario, key, value)

    await db.commit()
    await db.refresh(db_usuario)
    try:
        await registrar_auditoria(db, usuario_id=current_user.id if current_user else None, nombre_usuario=getattr(current_user, 'correo', None), rol_usuario=getattr(current_user, 'rol_obj', None).nombre if getattr(current_user, 'rol_obj', None) else None, accion='actualizar_usuario', modulo='usuarios', entidad_afectada='usuario', entidad_id=str(db_usuario.id), descripcion=f'Usuario actualizado: {db_usuario.correo}', metodo_http='PUT', endpoint=f'/usuarios/{usuario_id}')
    except Exception:
        pass
    return db_usuario


@router.delete("/usuarios/{usuario_id}")
async def delete_usuario(usuario_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalars().first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.deleted_at = datetime.utcnow()
    await db.commit()
    try:
        # No hay current_user dependency aquí en la firma; no obstante, registrar sin actor
        await registrar_auditoria(db, usuario_id=None, nombre_usuario=None, rol_usuario=None, accion='desactivar_usuario', modulo='usuarios', entidad_afectada='usuario', entidad_id=str(usuario_id), descripcion=f'Usuario desactivado: {usuario.correo}', metodo_http='DELETE', endpoint=f'/usuarios/{usuario_id}')
    except Exception:
        pass
    return {"message": "Usuario desactivado correctamente"}


@router.patch("/usuarios/{usuario_id}/restore")
async def restore_usuario(
    usuario_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Usuario).where(Usuario.id == usuario_id))
    usuario = result.scalars().first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.deleted_at = None
    await db.commit()
    return {"message": "Usuario restaurado correctamente"}
