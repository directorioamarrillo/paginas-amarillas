from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from api.db.conexion import get_db
from api.models.models import Rol, Permiso
from api.schemas.schemas import RolCreate, RolResponse
from api.api.auth import can_view_deleted_records, require_permission
from seeders.seed_permisos import Permisos
from api.services.audit_service import registrar_auditoria

router = APIRouter()


@router.get("/roles", response_model=List[RolResponse])
async def list_roles(
    skip: int = 0,
    limit: int = 10,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Rol).options(selectinload(Rol.permisos))
    if not can_view_deleted:
        query = query.where(Rol.deleted_at.is_(None))
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()


@router.post("/roles", response_model=RolResponse, status_code=201)
async def create_role(
    payload: RolCreate,
    current_user = Depends(require_permission(Permisos.CREAR_ROLES)),
    db: AsyncSession = Depends(get_db)
):
    db_role = Rol(nombre=payload.nombre, descripcion=payload.descripcion)
    if payload.permiso_ids:
        permisos_result = await db.execute(select(Permiso).where(Permiso.id.in_(payload.permiso_ids)))
        permisos = permisos_result.scalars().all()
        db_role.permisos = permisos
    db.add(db_role)
    await db.commit()
    await db.refresh(db_role)
    try:
        await registrar_auditoria(db, usuario_id=current_user.id if current_user else None, nombre_usuario=getattr(current_user,'correo',None) if current_user else None, rol_usuario=getattr(getattr(current_user,'rol_obj',None),'nombre',None) if current_user else None, accion='crear_role', modulo='roles', entidad_afectada='role', entidad_id=str(db_role.id), descripcion=f'Rol creado: {db_role.nombre}', metodo_http='POST', endpoint='/roles')
    except Exception:
        pass
    return db_role


@router.get("/roles/{id_rol}", response_model=RolResponse)
async def get_role(
    id_rol: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Rol).options(selectinload(Rol.permisos)).where(Rol.id == id_rol)
    if not can_view_deleted:
        query = query.where(Rol.deleted_at.is_(None))
    result = await db.execute(query)
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put("/roles/{id_rol}", response_model=RolResponse)
async def update_role(
    id_rol: int,
    payload: RolCreate,
    current_user = Depends(require_permission(Permisos.MODIFICAR_ROLES)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Rol).options(selectinload(Rol.permisos)).where(Rol.id == id_rol))
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role.nombre = payload.nombre
    role.descripcion = payload.descripcion
    if payload.permiso_ids:
        permisos_result = await db.execute(select(Permiso).where(Permiso.id.in_(payload.permiso_ids)))
        permisos = permisos_result.scalars().all()
        role.permisos = permisos
    await db.commit()
    await db.refresh(role)
    try:
        await registrar_auditoria(db, usuario_id=current_user.id if current_user else None, nombre_usuario=getattr(current_user,'correo',None) if current_user else None, rol_usuario=getattr(getattr(current_user,'rol_obj',None),'nombre',None) if current_user else None, accion='actualizar_role', modulo='roles', entidad_afectada='role', entidad_id=str(role.id), descripcion=f'Rol actualizado: {role.nombre}', metodo_http='PUT', endpoint=f'/roles/{id_rol}')
    except Exception:
        pass
    return role


@router.delete("/roles/{id_rol}")
async def delete_role(id_rol: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Rol).where(Rol.id == id_rol))
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role.deleted_at = datetime.utcnow()
    await db.commit()
    try:
        await registrar_auditoria(db, usuario_id=None, nombre_usuario=None, rol_usuario=None, accion='desactivar_role', modulo='roles', entidad_afectada='role', entidad_id=str(role.id), descripcion=f'Rol desactivado: {role.nombre}', metodo_http='DELETE', endpoint=f'/roles/{id_rol}')
    except Exception:
        pass
    return {"detail": "Role deactivated"}


@router.patch("/roles/{id_rol}/restore")
async def restore_role(
    id_rol: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Rol).where(Rol.id == id_rol))
    role = result.scalars().first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    role.deleted_at = None
    await db.commit()
    return {"detail": "Role restored"}
