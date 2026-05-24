from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# =======================
# SCHEMAS BASE
# =======================

class TicketBase(BaseModel):
    titulo: str = Field(..., max_length=200)
    descripcion: str
    categoria: str = Field(..., max_length=50)
    prioridad: str = Field(default="MEDIA", max_length=20)
    id_empresa: Optional[int] = None
    id_producto: Optional[int] = None
    origen: Optional[str] = "WEB"

class TicketCreate(TicketBase):
    pass

class TicketEstadoUpdate(BaseModel):
    estado: str

class TicketPrioridadUpdate(BaseModel):
    prioridad: str

class TicketAsignarUpdate(BaseModel):
    asignado_a_id: Optional[int] = None
    estado: Optional[str] = None
    prioridad: Optional[str] = None
    asignado_a_id: Optional[int] = None
    categoria: Optional[str] = None

class TicketMensajeBase(BaseModel):
    mensaje: str
    es_nota_interna: bool = False

class TicketMensajeCreate(TicketMensajeBase):
    pass

# =======================
# SCHEMAS DE RESPUESTA
# =======================

class UsuarioResumen(BaseModel):
    id_usuario: Optional[int] = None
    nombre: str
    apellido: str
    correo: str
    rol: Optional[str] = None

    model_config = {"from_attributes": True}

class EmpresaResumen(BaseModel):
    id_empresa: Optional[int] = None
    nombre: str

    model_config = {"from_attributes": True}

class AdjuntoResponse(BaseModel):
    id_adjunto: int
    nombre_archivo: str
    ruta_archivo: str
    tipo_archivo: Optional[str] = None
    fecha_creacion: datetime

    model_config = {"from_attributes": True}

class TicketMensajeResponse(BaseModel):
    id_mensaje: int
    id_ticket: int
    mensaje: str
    es_nota_interna: int
    rol_usuario: Optional[str] = None
    fecha_creacion: datetime
    usuario: Optional[UsuarioResumen] = None
    adjuntos: List[AdjuntoResponse] = []

    model_config = {"from_attributes": True}

class TicketResponse(BaseModel):
    id_ticket: int
    codigo_ticket: str
    titulo: str
    descripcion: str
    categoria: str
    prioridad: str
    estado: str
    origen: Optional[str]
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    fecha_cierre: Optional[datetime] = None
    
    usuario: Optional[UsuarioResumen] = None
    empresa: Optional[EmpresaResumen] = None
    asignado_a: Optional[UsuarioResumen] = None

    model_config = {"from_attributes": True}

class TicketHistorialResponse(BaseModel):
    id_historial: int
    id_ticket: int
    id_usuario: Optional[int] = None
    accion: str
    valor_anterior: Optional[str] = None
    valor_nuevo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_creacion: datetime
    usuario: Optional[UsuarioResumen] = None

    model_config = {"from_attributes": True}


class TicketDetalleResponse(TicketResponse):
    mensajes: List[TicketMensajeResponse] = []
    adjuntos: List[AdjuntoResponse] = []
    historial: List[TicketHistorialResponse] = []

    model_config = {"from_attributes": True}


class TicketStatsResponse(BaseModel):
    total: int
    abiertos: int
    en_proceso: int
    pendiente_usuario: int
    resueltos: int
    cerrados: int
    por_prioridad: dict
    por_categoria: dict


