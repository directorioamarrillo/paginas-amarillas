from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_, or_, desc, text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime

from app.db.conexion import get_db
from app.api.auth import get_current_user, get_current_user_optional
from app.models.models import AuditLog, Empresa
from sqlalchemy import or_, and_
from fastapi.responses import Response
import csv
import io
from sqlalchemy import func
from fastapi import BackgroundTasks
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

router = APIRouter()


@router.get('/auditoria/', tags=['Auditoría'])
async def list_audit_logs(
    skip: int = 0,
    limit: int = 25,
    fecha_desde: Optional[datetime] = Query(None),
    fecha_hasta: Optional[datetime] = Query(None),
    usuario: Optional[str] = Query(None),
    rol: Optional[str] = Query(None),
    accion: Optional[str] = Query(None),
    modulo: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    ip: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    sort: Optional[str] = Query('timestamp_desc'),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Permisos: solo ADMIN ve todo
    rol_nombre = getattr(getattr(current_user, 'rol_obj', None), 'nombre', None)
    is_admin = str(rol_nombre or '').lower() == 'admin'

    query = select(AuditLog)

    filters = []
    if fecha_desde:
        filters.append(AuditLog.timestamp >= fecha_desde)
    if fecha_hasta:
        filters.append(AuditLog.timestamp <= fecha_hasta)
    if usuario:
        filters.append(AuditLog.nombre_usuario.ilike(f"%{usuario}%"))
    if rol:
        filters.append(AuditLog.rol_usuario.ilike(f"%{rol}%"))
    if accion:
        filters.append(AuditLog.accion.ilike(f"%{accion}%"))
    if modulo:
        filters.append(AuditLog.modulo.ilike(f"%{modulo}%"))
    if estado:
        filters.append(AuditLog.estado_evento.ilike(f"%{estado}%"))
    if ip:
        filters.append(AuditLog.ip == ip)
    if q:
        qf = f"%{q}%"
        filters.append(or_(AuditLog.descripcion.ilike(qf), AuditLog.datos_nuevos.ilike(qf), AuditLog.datos_anteriores.ilike(qf)))

    if filters:
        query = query.where(and_(*filters))

    # Si no es admin, aplicar reglas adicionales
    if not is_admin:
        rol_lower = str(rol_nombre or '').lower()
        if rol_lower == 'comerciante':
            # Obtener IDs de empresas relacionadas con el comerciante
            empresa_q = select(Empresa.id).where(or_(Empresa.id_usuario_creador == current_user.id, Empresa.id == getattr(current_user, 'id_empresa', None)))
            empresa_res = await db.execute(empresa_q)
            empresa_ids = [str(x) for x in empresa_res.scalars().all()]

            allowed_entities = ['empresa', 'empresas', 'marketplace', 'marketplaces', 'publicidad', 'publicidades']

            if empresa_ids:
                query = query.where(or_(AuditLog.usuario_id == current_user.id, and_(AuditLog.entidad_afectada.in_(allowed_entities), AuditLog.entidad_id.in_(empresa_ids))))
            else:
                query = query.where(AuditLog.usuario_id == current_user.id)
        else:
            # Usuarios normales solo ven sus propias acciones
            query = query.where(AuditLog.usuario_id == current_user.id)

    # Ordenamiento
    if sort == 'timestamp_desc':
        query = query.order_by(desc(AuditLog.timestamp))
    elif sort == 'timestamp_asc':
        query = query.order_by(AuditLog.timestamp)

    total_result = await db.execute(select(AuditLog).where(query._whereclause) if query._whereclause is not None else select(AuditLog))
    total = len(total_result.scalars().all())

    result = await db.execute(query.offset(skip).limit(limit))
    items = result.scalars().all()

    # Mapear a dict simple para evitar depender del ORM al serializar
    def serialize(a: AuditLog):
        return {
            'id': a.id,
            'usuario_id': a.usuario_id,
            'nombre_usuario': a.nombre_usuario,
            'rol_usuario': a.rol_usuario,
            'accion': a.accion,
            'modulo': a.modulo,
            'entidad_afectada': a.entidad_afectada,
            'entidad_id': a.entidad_id,
            'descripcion': a.descripcion,
            'metodo_http': a.metodo_http,
            'endpoint': a.endpoint,
            'ip': a.ip,
            'user_agent': a.user_agent,
            'datos_anteriores': a.datos_anteriores,
            'datos_nuevos': a.datos_nuevos,
            'estado_evento': a.estado_evento,
            'timestamp': a.timestamp,
        }

    return { 'total': total, 'items': [serialize(i) for i in items] }



@router.get('/auditoria/export', tags=['Auditoría'])
async def export_audit_logs(
    fecha_desde: Optional[datetime] = Query(None),
    fecha_hasta: Optional[datetime] = Query(None),
    usuario: Optional[str] = Query(None),
    rol: Optional[str] = Query(None),
    accion: Optional[str] = Query(None),
    modulo: Optional[str] = Query(None),
    estado: Optional[str] = Query(None),
    ip: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Reusar la lógica de filtros simplificada
    query = select(AuditLog)
    filters = []
    if fecha_desde:
        filters.append(AuditLog.timestamp >= fecha_desde)
    if fecha_hasta:
        filters.append(AuditLog.timestamp <= fecha_hasta)
    if usuario:
        filters.append(AuditLog.nombre_usuario.ilike(f"%{usuario}%"))
    if rol:
        filters.append(AuditLog.rol_usuario.ilike(f"%{rol}%"))
    if accion:
        filters.append(AuditLog.accion.ilike(f"%{accion}%"))
    if modulo:
        filters.append(AuditLog.modulo.ilike(f"%{modulo}%"))
    if estado:
        filters.append(AuditLog.estado_evento.ilike(f"%{estado}%"))
    if ip:
        filters.append(AuditLog.ip == ip)
    if q:
        qf = f"%{q}%"
        filters.append(or_(AuditLog.descripcion.ilike(qf), AuditLog.datos_nuevos.ilike(qf), AuditLog.datos_anteriores.ilike(qf)))

    if filters:
        query = query.where(and_(*filters))

    # Aplicar permiso similar a list_audit_logs: solo admin o comerciante con alcance
    rol_nombre = getattr(getattr(current_user, 'rol_obj', None), 'nombre', None)
    is_admin = str(rol_nombre or '').lower() == 'admin'
    if not is_admin:
        rol_lower = str(rol_nombre or '').lower()
        if rol_lower == 'comerciante':
            empresa_q = select(Empresa.id).where(or_(Empresa.id_usuario_creador == current_user.id, Empresa.id == getattr(current_user, 'id_empresa', None)))
            empresa_res = await db.execute(empresa_q)
            empresa_ids = [str(x) for x in empresa_res.scalars().all()]
            allowed_entities = ['empresa', 'empresas', 'marketplace', 'marketplaces', 'publicidad', 'publicidades']
            if empresa_ids:
                query = query.where(or_(AuditLog.usuario_id == current_user.id, and_(AuditLog.entidad_afectada.in_(allowed_entities), AuditLog.entidad_id.in_(empresa_ids))))
            else:
                query = query.where(AuditLog.usuario_id == current_user.id)
        else:
            query = query.where(AuditLog.usuario_id == current_user.id)

    result = await db.execute(query.order_by(desc(AuditLog.timestamp)))
    items = result.scalars().all()

    # Generar CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['id','timestamp','usuario','rol','accion','modulo','entidad','entidad_id','descripcion','ip','endpoint','estado'])
    for a in items:
        writer.writerow([
            a.id,
            a.timestamp,
            a.nombre_usuario,
            a.rol_usuario,
            a.accion,
            a.modulo,
            a.entidad_afectada,
            a.entidad_id,
            (a.descripcion or '').replace('\n',' '),
            a.ip,
            a.endpoint,
            a.estado_evento,
        ])

    csv_data = output.getvalue()
    return Response(content=csv_data, media_type='text/csv', headers={"Content-Disposition": "attachment; filename=auditoria.csv"})


@router.get('/auditoria/export/pdf', tags=['Auditoría'])
async def export_audit_pdf(
    fecha_desde: Optional[datetime] = Query(None),
    fecha_hasta: Optional[datetime] = Query(None),
    q: Optional[str] = Query(None),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Reusar CSV query but limit fields
    query = select(AuditLog)
    filters = []
    if fecha_desde:
        filters.append(AuditLog.timestamp >= fecha_desde)
    if fecha_hasta:
        filters.append(AuditLog.timestamp <= fecha_hasta)
    if q:
        qf = f"%{q}%"
        filters.append(or_(AuditLog.descripcion.ilike(qf), AuditLog.datos_nuevos.ilike(qf), AuditLog.datos_anteriores.ilike(qf)))
    if filters:
        query = query.where(and_(*filters))

    # Aplicar permisos similares
    rol_nombre = getattr(getattr(current_user, 'rol_obj', None), 'nombre', None)
    is_admin = str(rol_nombre or '').lower() == 'admin'
    if not is_admin:
        query = query.where(AuditLog.usuario_id == current_user.id)

    result = await db.execute(query.order_by(desc(AuditLog.timestamp)).limit(1000))
    items = result.scalars().all()

    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
    except Exception:
        raise HTTPException(status_code=501, detail="PDF export requires 'reportlab' package on the server")

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 40
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y, "Auditoría - Exportación PDF")
    y -= 30
    c.setFont("Helvetica", 9)
    for a in items:
        text = f"[{a.timestamp}] {a.nombre_usuario or 'anon'} | {a.rol_usuario or ''} | {a.accion} | {a.modulo} | {a.entidad_afectada or ''}#{a.entidad_id or ''}"
        c.drawString(40, y, text[:120])
        y -= 14
        if y < 60:
            c.showPage()
            y = height - 40
    c.save()
    buffer.seek(0)
    return Response(content=buffer.read(), media_type='application/pdf', headers={"Content-Disposition": "attachment; filename=auditoria.pdf"})


@router.get('/auditoria/{audit_id}', tags=['Auditoría'])
async def get_audit_detail(audit_id: int, current_user = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLog).where(AuditLog.id == audit_id))
    rec = result.scalars().first()
    if not rec:
        raise HTTPException(status_code=404, detail='Registro no encontrado')

    # Si no admin y no propietario, denegar
    rol_nombre = getattr(getattr(current_user, 'rol_obj', None), 'nombre', None)
    is_admin = str(rol_nombre or '').lower() == 'admin'
    if not is_admin and rec.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail='Acceso denegado')

    return {
        'id': rec.id,
        'usuario_id': rec.usuario_id,
        'nombre_usuario': rec.nombre_usuario,
        'rol_usuario': rec.rol_usuario,
        'accion': rec.accion,
        'modulo': rec.modulo,
        'entidad_afectada': rec.entidad_afectada,
        'entidad_id': rec.entidad_id,
        'descripcion': rec.descripcion,
        'metodo_http': rec.metodo_http,
        'endpoint': rec.endpoint,
        'ip': rec.ip,
        'user_agent': rec.user_agent,
        'datos_anteriores': rec.datos_anteriores,
        'datos_nuevos': rec.datos_nuevos,
        'estado_evento': rec.estado_evento,
        'timestamp': rec.timestamp,
    }


@router.get('/auditoria/report/summary', tags=['Auditoría'])
async def audit_report_summary(
    fecha_desde: Optional[datetime] = Query(None),
    fecha_hasta: Optional[datetime] = Query(None),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retorna counts agrupados por módulo y por acción para generar reportes rápidos."""
    query = select(AuditLog)
    filters = []
    if fecha_desde:
        filters.append(AuditLog.timestamp >= fecha_desde)
    if fecha_hasta:
        filters.append(AuditLog.timestamp <= fecha_hasta)
    if filters:
        query = query.where(and_(*filters))

    # Permisos
    rol_nombre = getattr(getattr(current_user, 'rol_obj', None), 'nombre', None)
    is_admin = str(rol_nombre or '').lower() == 'admin'
    if not is_admin:
        query = query.where(AuditLog.usuario_id == current_user.id)

    # Agrupar por modulo
    mod_q = select(AuditLog.modulo, func.count().label('count')).where(query._whereclause).group_by(AuditLog.modulo)
    res_mod = await db.execute(mod_q)
    módulos = [{ 'modulo': r[0] or 'sin_modulo', 'count': int(r[1]) } for r in res_mod.all()]

    # Agrupar por accion
    act_q = select(AuditLog.accion, func.count().label('count')).where(query._whereclause).group_by(AuditLog.accion).order_by(func.count().desc())
    res_act = await db.execute(act_q)
    acciones = [{ 'accion': r[0] or 'sin_accion', 'count': int(r[1]) } for r in res_act.all()]

    return {
        'módulos': módulos,
        'acciones': acciones,
    }


@router.get('/auditoria/report/timeseries', tags=['Auditoría'])
async def audit_report_timeseries(
    fecha_desde: Optional[datetime] = Query(None),
    fecha_hasta: Optional[datetime] = Query(None),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retorna conteo diario de eventos para el rango solicitado."""
    filters = []
    if fecha_desde:
        filters.append(AuditLog.timestamp >= fecha_desde)
    if fecha_hasta:
        filters.append(AuditLog.timestamp <= fecha_hasta)
    where_clause = and_(*filters) if filters else None

    # Permisos
    rol_nombre = getattr(getattr(current_user, 'rol_obj', None), 'nombre', None)
    is_admin = str(rol_nombre or '').lower() == 'admin'
    if not is_admin:
        if where_clause is not None:
            where_clause = and_(where_clause, AuditLog.usuario_id == current_user.id)
        else:
            where_clause = (AuditLog.usuario_id == current_user.id)

    # Agrupar por fecha (date)
    date_col = func.date(AuditLog.timestamp)
    ts_q = select(date_col.label('day'), func.count().label('count'))
    if where_clause is not None:
        ts_q = ts_q.where(where_clause)
    ts_q = ts_q.group_by(date_col).order_by(date_col)

    res_ts = await db.execute(ts_q)
    timeseries = [{ 'day': str(r[0]), 'count': int(r[1]) } for r in res_ts.all()]

    return { 'timeseries': timeseries }



@router.get('/auditoria/report/summary/pdf', tags=['Auditoría'])
async def audit_report_summary_pdf(
    fecha_desde: Optional[datetime] = Query(None),
    fecha_hasta: Optional[datetime] = Query(None),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Reuse summary endpoint logic
    summary = await audit_report_summary(fecha_desde=fecha_desde, fecha_hasta=fecha_hasta, current_user=current_user, db=db)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elems = []
    elems.append(Paragraph('Registro de Actividad - Resumen', styles['Title']))
    elems.append(Spacer(1, 12))

    # Módulos table
    módulos = summary.get('módulos', [])
    if módulos:
        elems.append(Paragraph('Por módulo', styles['Heading3']))
        data = [['Módulo', 'Conteo']] + [[m['modulo'], str(m['count'])] for m in módulos]
        t = Table(data, colWidths=[300, 100])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f3f4f6')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('ALIGN',(1,1),(-1,-1),'RIGHT')
        ]))
        elems.append(t)
        elems.append(Spacer(1,12))

    acciones = summary.get('acciones', [])
    if acciones:
        elems.append(Paragraph('Por acción', styles['Heading3']))
        data = [['Acción', 'Conteo']] + [[a['accion'], str(a['count'])] for a in acciones]
        t2 = Table(data, colWidths=[300, 100])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f3f4f6')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('ALIGN',(1,1),(-1,-1),'RIGHT')
        ]))
        elems.append(t2)

    doc.build(elems)
    buffer.seek(0)
    return Response(content=buffer.read(), media_type='application/pdf', headers={"Content-Disposition": "attachment; filename=reporte_resumen_auditoria.pdf"})
