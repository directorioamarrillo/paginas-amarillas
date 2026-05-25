from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid
from datetime import datetime
from pathlib import Path

from app.db.conexion import get_async_db as get_db
from app.models import models
from app.schemas import tickets as schemas_tickets
from app.api.auth import get_current_user
from app.services.audit_service import registrar_auditoria
from app.utils.uploads import get_upload_root, ensure_upload_dir

router = APIRouter()

ALLOWED_TICKET_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".pdf", ".txt", ".doc", ".docx", ".xls", ".xlsx", ".zip"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

def get_user_role(user: models.Usuario) -> str:
    if getattr(user, 'rol_obj', None):
        return getattr(user.rol_obj, 'nombre', 'user') or 'user'
    return 'user'

def generar_codigo_ticket():
    return f"TK-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

def _safe_ticket_extension(filename: str) -> str:
    ext = Path(filename or "").suffix.lower()
    if ext not in ALLOWED_TICKET_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no soportado. Formatos válidos: {', '.join(ALLOWED_TICKET_EXTENSIONS)}",
        )
    return ext

async def save_ticket_upload(upload: UploadFile, destination_dir: Path) -> str:
    ext = _safe_ticket_extension(upload.filename or "")
    content = await upload.read()
    if not content:
        raise HTTPException(status_code=400, detail="Archivo vacío")
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="El archivo supera el límite de 10MB")
    file_name = f"{uuid.uuid4().hex}{ext}"
    file_path = destination_dir / file_name
    with open(file_path, "wb") as f:
        f.write(content)
    return file_name


@router.post("/", response_model=schemas_tickets.TicketResponse, status_code=status.HTTP_201_CREATED)
async def crear_ticket(
    ticket_in: schemas_tickets.TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    # Extraer atributos ANTES de cualquier await para evitar MissingGreenlet
    uid = current_user.id
    ucorreo = current_user.correo
    urol = get_user_role(current_user)

    nuevo_ticket = models.Ticket(
        codigo_ticket=generar_codigo_ticket(),
        id_usuario=uid,
        id_empresa=ticket_in.id_empresa,
        id_producto=ticket_in.id_producto,
        titulo=ticket_in.titulo,
        descripcion=ticket_in.descripcion,
        categoria=ticket_in.categoria,
        prioridad=ticket_in.prioridad,
        origen=ticket_in.origen
    )
    
    db.add(nuevo_ticket)
    await db.commit()
    await db.refresh(nuevo_ticket)

    historial = models.TicketHistorial(
        id_ticket=nuevo_ticket.id_ticket,
        id_usuario=uid,
        accion="CREACION",
        valor_nuevo="ABIERTO",
        descripcion="El ticket fue creado."
    )
    db.add(historial)
    await db.commit()

    # Load relations for serialization
    stmt = (
        select(models.Ticket)
        .options(
            selectinload(models.Ticket.usuario),
            selectinload(models.Ticket.empresa),
            selectinload(models.Ticket.asignado_a),
        )
        .where(models.Ticket.id_ticket == nuevo_ticket.id_ticket)
    )
    res = await db.execute(stmt)
    nuevo_ticket_loaded = res.scalars().first()

    await registrar_auditoria(
        db=db,
        usuario_id=uid,
        nombre_usuario=ucorreo,
        rol_usuario=urol,
        accion="CREAR_TICKET",
        modulo="Mesa de Servicios",
        entidad_afectada="Ticket",
        entidad_id=str(nuevo_ticket.id_ticket),
        descripcion="El usuario creo un nuevo ticket de soporte.",
        metodo_http="POST",
        endpoint="/tickets/"
    )

    return nuevo_ticket_loaded



@router.get("/stats", response_model=schemas_tickets.TicketStatsResponse)
async def obtener_estadisticas_tickets(
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    uid = current_user.id
    urol = get_user_role(current_user)
    stmt = select(models.Ticket).where(models.Ticket.activo == 1)
    if urol not in ["admin", "superadmin"]:
        stmt = stmt.where(models.Ticket.id_usuario == uid)
    
    res = await db.execute(stmt)
    tickets = res.scalars().all()
    
    total = len(tickets)
    abiertos = sum(1 for t in tickets if t.estado == "ABIERTO")
    en_proceso = sum(1 for t in tickets if t.estado == "EN_PROCESO")
    pendiente_usuario = sum(1 for t in tickets if t.estado == "PENDIENTE_USUARIO")
    resueltos = sum(1 for t in tickets if t.estado == "RESUELTO")
    cerrados = sum(1 for t in tickets if t.estado == "CERRADO")
    
    por_prioridad = {}
    por_categoria = {}
    
    for t in tickets:
        prio = t.prioridad or "MEDIA"
        cat = t.categoria or "OTROS"
        por_prioridad[prio] = por_prioridad.get(prio, 0) + 1
        por_categoria[cat] = por_categoria.get(cat, 0) + 1
        
    return {
        "total": total,
        "abiertos": abiertos,
        "en_proceso": en_proceso,
        "pendiente_usuario": pendiente_usuario,
        "resueltos": resueltos,
        "cerrados": cerrados,
        "por_prioridad": por_prioridad,
        "por_categoria": por_categoria
    }


@router.get("/mis-tickets", response_model=List[schemas_tickets.TicketResponse])
async def listar_mis_tickets(
    estado: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    uid = current_user.id
    stmt = (
        select(models.Ticket)
        .options(
            selectinload(models.Ticket.usuario),
            selectinload(models.Ticket.empresa),
            selectinload(models.Ticket.asignado_a),
        )
        .where(models.Ticket.id_usuario == uid)
    )
    if estado:
        stmt = stmt.where(models.Ticket.estado == estado)
    stmt = stmt.order_by(desc(models.Ticket.fecha_creacion))
    res = await db.execute(stmt)
    tickets = res.scalars().all()
    return tickets


@router.get("/{id_ticket}", response_model=schemas_tickets.TicketDetalleResponse)
async def ver_detalle_ticket(
    id_ticket: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    uid = current_user.id
    urol = get_user_role(current_user)
    stmt = (
        select(models.Ticket)
        .options(
            selectinload(models.Ticket.usuario),
            selectinload(models.Ticket.empresa),
            selectinload(models.Ticket.asignado_a),
            selectinload(models.Ticket.mensajes).selectinload(models.TicketMensaje.usuario),
            selectinload(models.Ticket.mensajes).selectinload(models.TicketMensaje.adjuntos),
            selectinload(models.Ticket.adjuntos),
            selectinload(models.Ticket.historial).selectinload(models.TicketHistorial.usuario),
        )
        .where(models.Ticket.id_ticket == id_ticket)
    )
    res = await db.execute(stmt)
    ticket = res.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if urol not in ["admin", "superadmin"] and ticket.id_usuario != uid:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este ticket")

    if urol not in ["admin", "superadmin"]:
        ticket.mensajes = [m for m in ticket.mensajes if not m.es_nota_interna]

    return ticket


@router.post("/{id_ticket}/mensajes", response_model=schemas_tickets.TicketMensajeResponse)
async def responder_ticket(
    id_ticket: int,
    mensaje_in: schemas_tickets.TicketMensajeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    uid = current_user.id
    urol = get_user_role(current_user)
    ucorreo = current_user.correo

    stmt = select(models.Ticket).where(models.Ticket.id_ticket == id_ticket)
    res = await db.execute(stmt)
    ticket = res.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    if mensaje_in.es_nota_interna and urol not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear notas internas")

    if urol not in ["admin", "superadmin"] and ticket.id_usuario != uid:
        raise HTTPException(status_code=403, detail="No tienes permiso para responder este ticket")

    nuevo_mensaje = models.TicketMensaje(
        id_ticket=ticket.id_ticket,
        id_usuario=uid,
        rol_usuario=urol,
        mensaje=mensaje_in.mensaje,
        es_nota_interna=1 if mensaje_in.es_nota_interna else 0
    )

    if urol in ["admin", "superadmin"] and not mensaje_in.es_nota_interna and ticket.estado == "ABIERTO":
        ticket.estado = "EN_PROCESO"
    
    ticket.fecha_actualizacion = datetime.utcnow()

    db.add(nuevo_mensaje)
    await db.commit()
    await db.refresh(nuevo_mensaje)

    stmt_msg = (
        select(models.TicketMensaje)
        .options(
            selectinload(models.TicketMensaje.usuario),
            selectinload(models.TicketMensaje.adjuntos),
        )
        .where(models.TicketMensaje.id_mensaje == nuevo_mensaje.id_mensaje)
    )
    res_msg = await db.execute(stmt_msg)
    nuevo_mensaje_loaded = res_msg.scalars().first()

    await registrar_auditoria(
        db=db,
        usuario_id=uid,
        nombre_usuario=ucorreo,
        rol_usuario=urol,
        accion="RESPONDER_TICKET",
        modulo="Mesa de Servicios",
        entidad_afectada="Ticket",
        entidad_id=str(ticket.id_ticket),
        descripcion="Nueva respuesta al ticket.",
        metodo_http="POST",
        endpoint=f"/tickets/{id_ticket}/mensajes"
    )

    return nuevo_mensaje_loaded


@router.get("/", response_model=List[schemas_tickets.TicketResponse])
async def listar_todos_los_tickets(
    estado: Optional[str] = None,
    prioridad: Optional[str] = None,
    categoria: Optional[str] = None,
    asignado: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    urol = get_user_role(current_user)
    if urol not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="No tienes permisos para listar todos los tickets")

    stmt = (
        select(models.Ticket)
        .options(
            selectinload(models.Ticket.usuario),
            selectinload(models.Ticket.empresa),
            selectinload(models.Ticket.asignado_a),
        )
    )
    if estado:
        stmt = stmt.where(models.Ticket.estado == estado)
    if prioridad:
        stmt = stmt.where(models.Ticket.prioridad == prioridad)
    if categoria:
        stmt = stmt.where(models.Ticket.categoria == categoria)
    if asignado:
        stmt = stmt.where(models.Ticket.asignado_a_id == asignado)
    stmt = stmt.order_by(desc(models.Ticket.fecha_creacion))
    res = await db.execute(stmt)
    return res.scalars().all()


@router.patch("/{id_ticket}/estado", response_model=schemas_tickets.TicketResponse)
async def cambiar_estado_ticket(
    id_ticket: int,
    update_in: schemas_tickets.TicketEstadoUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    stmt = select(models.Ticket).where(models.Ticket.id_ticket == id_ticket)
    res = await db.execute(stmt)
    ticket = res.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    urol = get_user_role(current_user)
    if update_in.estado in ["CERRADO", "RESUELTO"] and urol not in ["admin", "superadmin"]:
        if ticket.id_usuario != current_user.id:
            raise HTTPException(status_code=403, detail="No tienes permisos")
    elif urol not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Solo administradores pueden cambiar este estado")

    valor_anterior = ticket.estado
    ticket.estado = update_in.estado
    ticket.fecha_actualizacion = datetime.utcnow()
    
    if update_in.estado in ["CERRADO", "RESUELTO"]:
        ticket.fecha_cierre = datetime.utcnow()
        ticket.cerrado_por_id = current_user.id

    historial = models.TicketHistorial(
        id_ticket=ticket.id_ticket,
        id_usuario=current_user.id,
        accion="CAMBIO_ESTADO",
        valor_anterior=valor_anterior,
        valor_nuevo=update_in.estado,
        descripcion=f"Estado cambiado a {update_in.estado}"
    )
    db.add(historial)
    await db.commit()
    
    # Reload relation for response
    stmt_ticket = (
        select(models.Ticket)
        .options(
            selectinload(models.Ticket.usuario),
            selectinload(models.Ticket.empresa),
            selectinload(models.Ticket.asignado_a),
        )
        .where(models.Ticket.id_ticket == ticket.id_ticket)
    )
    res_t = await db.execute(stmt_ticket)
    ticket_loaded = res_t.scalars().first()

    await registrar_auditoria(
        db=db,
        usuario_id=current_user.id,
        nombre_usuario=current_user.correo,
        rol_usuario=urol,
        accion="CAMBIAR_ESTADO_TICKET",
        modulo="Mesa de Servicios",
        entidad_afectada="Ticket",
        entidad_id=str(ticket.id_ticket),
        descripcion=f"Cambio de estado: {valor_anterior} -> {update_in.estado}",
        metodo_http="PATCH",
        endpoint=f"/tickets/{id_ticket}/estado"
    )
    return ticket_loaded


@router.patch("/{id_ticket}/prioridad", response_model=schemas_tickets.TicketResponse)
async def cambiar_prioridad_ticket(
    id_ticket: int,
    update_in: schemas_tickets.TicketPrioridadUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    urol = get_user_role(current_user)
    if urol not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Sin permisos")

    stmt = select(models.Ticket).where(models.Ticket.id_ticket == id_ticket)
    res = await db.execute(stmt)
    ticket = res.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    valor_anterior = ticket.prioridad
    ticket.prioridad = update_in.prioridad
    ticket.fecha_actualizacion = datetime.utcnow()

    historial = models.TicketHistorial(
        id_ticket=ticket.id_ticket,
        id_usuario=current_user.id,
        accion="CAMBIO_PRIORIDAD",
        valor_anterior=valor_anterior,
        valor_nuevo=update_in.prioridad,
        descripcion=f"Prioridad cambiada a {update_in.prioridad}"
    )
    db.add(historial)
    await db.commit()
    
    # Reload relation
    stmt_ticket = (
        select(models.Ticket)
        .options(
            selectinload(models.Ticket.usuario),
            selectinload(models.Ticket.empresa),
            selectinload(models.Ticket.asignado_a),
        )
        .where(models.Ticket.id_ticket == ticket.id_ticket)
    )
    res_t = await db.execute(stmt_ticket)
    ticket_loaded = res_t.scalars().first()

    await registrar_auditoria(
        db=db,
        usuario_id=current_user.id,
        nombre_usuario=current_user.correo,
        rol_usuario=urol,
        accion="CAMBIAR_PRIORIDAD_TICKET",
        modulo="Mesa de Servicios",
        entidad_afectada="Ticket",
        entidad_id=str(ticket.id_ticket),
        descripcion=f"Cambio de prioridad: {valor_anterior} -> {update_in.prioridad}",
        metodo_http="PATCH",
        endpoint=f"/tickets/{id_ticket}/prioridad"
    )
    return ticket_loaded


@router.patch("/{id_ticket}/asignar", response_model=schemas_tickets.TicketResponse)
async def asignar_ticket(
    id_ticket: int,
    update_in: schemas_tickets.TicketAsignarUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    urol = get_user_role(current_user)
    if urol not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Sin permisos")

    stmt = select(models.Ticket).where(models.Ticket.id_ticket == id_ticket)
    res = await db.execute(stmt)
    ticket = res.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")

    valor_anterior = str(ticket.asignado_a_id) if ticket.asignado_a_id else "Ninguno"
    ticket.asignado_a_id = update_in.asignado_a_id
    ticket.fecha_actualizacion = datetime.utcnow()

    historial = models.TicketHistorial(
        id_ticket=ticket.id_ticket,
        id_usuario=current_user.id,
        accion="ASIGNACION",
        valor_anterior=valor_anterior,
        valor_nuevo=str(update_in.asignado_a_id),
        descripcion="Reasignación de responsable"
    )
    db.add(historial)
    await db.commit()
    
    # Reload relation
    stmt_ticket = (
        select(models.Ticket)
        .options(
            selectinload(models.Ticket.usuario),
            selectinload(models.Ticket.empresa),
            selectinload(models.Ticket.asignado_a),
        )
        .where(models.Ticket.id_ticket == ticket.id_ticket)
    )
    res_t = await db.execute(stmt_ticket)
    ticket_loaded = res_t.scalars().first()

    await registrar_auditoria(
        db=db,
        usuario_id=current_user.id,
        nombre_usuario=current_user.correo,
        rol_usuario=urol,
        accion="ASIGNAR_TICKET",
        modulo="Mesa de Servicios",
        entidad_afectada="Ticket",
        entidad_id=str(ticket.id_ticket),
        descripcion=f"El ticket fue asignado a {update_in.asignado_a_id or 'Ninguno'}.",
        metodo_http="PATCH",
        endpoint=f"/tickets/{id_ticket}/asignar"
    )
    return ticket_loaded


@router.get("/{id_ticket}/historial", response_model=List[schemas_tickets.TicketHistorialResponse])
async def obtener_historial_ticket(
    id_ticket: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    stmt = select(models.Ticket).where(models.Ticket.id_ticket == id_ticket)
    res = await db.execute(stmt)
    ticket = res.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    urol = get_user_role(current_user)
    if urol not in ["admin", "superadmin"] and ticket.id_usuario != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para ver el historial de este ticket")
    
    stmt_hist = (
        select(models.TicketHistorial)
        .options(selectinload(models.TicketHistorial.usuario))
        .where(models.TicketHistorial.id_ticket == id_ticket)
        .order_by(desc(models.TicketHistorial.fecha_creacion))
    )
    res_h = await db.execute(stmt_hist)
    return res_h.scalars().all()


@router.post("/{id_ticket}/adjuntos", response_model=List[schemas_tickets.AdjuntoResponse], status_code=status.HTTP_201_CREATED)
async def subir_adjuntos_ticket(
    id_ticket: int,
    archivos: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    stmt = select(models.Ticket).where(models.Ticket.id_ticket == id_ticket)
    res = await db.execute(stmt)
    ticket = res.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    urol = get_user_role(current_user)
    if urol not in ["admin", "superadmin"] and ticket.id_usuario != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para subir archivos a este ticket")
    
    upload_root = get_upload_root()
    dest_dir = ensure_upload_dir(upload_root, "tickets")
    
    adjuntos_creados = []
    for archivo in archivos:
        file_name = await save_ticket_upload(archivo, dest_dir)
        public_url = f"/uploads/tickets/{file_name}"
        
        adjunto = models.TicketAdjunto(
            id_ticket=ticket.id_ticket,
            id_mensaje=None,
            nombre_archivo=archivo.filename,
            ruta_archivo=public_url,
            tipo_archivo=archivo.content_type,
            tamano_archivo=None,
            subido_por_id=current_user.id
        )
        db.add(adjunto)
        adjuntos_creados.append(adjunto)
        
    await db.commit()
    for adj in adjuntos_creados:
        await db.refresh(adj)
        
    await registrar_auditoria(
        db=db,
        usuario_id=current_user.id,
        nombre_usuario=current_user.correo,
        rol_usuario=urol,
        accion="SUBIR_ADJUNTOS_TICKET",
        modulo="Mesa de Servicios",
        entidad_afectada="Ticket",
        entidad_id=str(ticket.id_ticket),
        descripcion=f"Se subieron {len(archivos)} archivos adjuntos al ticket.",
        metodo_http="POST",
        endpoint=f"/tickets/{id_ticket}/adjuntos"
    )
    
    return adjuntos_creados


@router.post("/{id_ticket}/mensajes/{id_mensaje}/adjuntos", response_model=List[schemas_tickets.AdjuntoResponse], status_code=status.HTTP_201_CREATED)
async def subir_adjuntos_mensaje(
    id_ticket: int,
    id_mensaje: int,
    archivos: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: models.Usuario = Depends(get_current_user)
):
    stmt = select(models.Ticket).where(models.Ticket.id_ticket == id_ticket)
    res = await db.execute(stmt)
    ticket = res.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
        
    stmt_msg = select(models.TicketMensaje).where(models.TicketMensaje.id_mensaje == id_mensaje)
    res_msg = await db.execute(stmt_msg)
    mensaje = res_msg.scalars().first()
    if not mensaje:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
        
    if mensaje.id_ticket != ticket.id_ticket:
        raise HTTPException(status_code=400, detail="El mensaje no pertenece al ticket especificado")
        
    urol = get_user_role(current_user)
    if urol not in ["admin", "superadmin"] and mensaje.id_usuario != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para subir archivos a este mensaje")
        
    upload_root = get_upload_root()
    dest_dir = ensure_upload_dir(upload_root, "tickets")
    
    adjuntos_creados = []
    for archivo in archivos:
        file_name = await save_ticket_upload(archivo, dest_dir)
        public_url = f"/uploads/tickets/{file_name}"
        
        adjunto = models.TicketAdjunto(
            id_ticket=ticket.id_ticket,
            id_mensaje=mensaje.id_mensaje,
            nombre_archivo=archivo.filename,
            ruta_archivo=public_url,
            tipo_archivo=archivo.content_type,
            tamano_archivo=None,
            subido_por_id=current_user.id
        )
        db.add(adjunto)
        adjuntos_creados.append(adjunto)
        
    await db.commit()
    for adj in adjuntos_creados:
        await db.refresh(adj)
        
    await registrar_auditoria(
        db=db,
        usuario_id=current_user.id,
        nombre_usuario=current_user.correo,
        rol_usuario=urol,
        accion="SUBIR_ADJUNTOS_MENSAJE",
        modulo="Mesa de Servicios",
        entidad_afectada="TicketMensaje",
        entidad_id=str(mensaje.id_mensaje),
        descripcion=f"Se subieron {len(archivos)} archivos adjuntos al mensaje del ticket.",
        metodo_http="POST",
        endpoint=f"/tickets/{id_ticket}/mensajes/{id_mensaje}/adjuntos"
    )
    
    return adjuntos_creados


