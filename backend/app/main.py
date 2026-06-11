"""Entrada principal de la API con manejo seguro de arranque y registro de errores.

Esta versión carga routers dinámicamente en el evento de `startup` y registra
excepciones para ayudar a identificar fallos silenciosos durante la inicialización.
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from fastapi.staticfiles import StaticFiles
import logging
import json
from fastapi.middleware.cors import CORSMiddleware
from importlib import import_module
from starlette.middleware.base import BaseHTTPMiddleware
from pathlib import Path
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.utils.rate_limit import limiter
from app.utils.logging_setup import configure_daily_logging
import jwt as pyjwt
from app.api import auth as auth_module
from app.db.conexion import async_session
from app.services.audit_service import registrar_auditoria
from app.services.audit_worker import attach_queued_worker
from app.services.audit_worker_redis import attach_redis_worker
import os

configure_daily_logging()

from app.db.conexion import lifespan

logger = logging.getLogger("uvicorn.error")


class LogMiddleware(BaseHTTPMiddleware):
    @staticmethod
    def _serialize_body(body: bytes, content_type: str | None) -> str:
        if not body:
            return "<empty>"

        max_chars = 4000
        content_type = (content_type or "").lower()

        if "application/json" in content_type:
            try:
                payload = json.loads(body.decode("utf-8"))
                if isinstance(payload, dict):
                    for key in ("password", "token", "access_token"):
                        if key in payload:
                            payload[key] = "***"
                serialized = json.dumps(payload, ensure_ascii=False)
            except Exception:
                serialized = body.decode("utf-8", errors="replace")
        elif content_type.startswith("multipart/form-data"):
            serialized = f"<multipart/form-data {len(body)} bytes>"
        else:
            serialized = body.decode("utf-8", errors="replace")

        if len(serialized) > max_chars:
            return f"{serialized[:max_chars]}... <truncated>"
        return serialized

    async def dispatch(self, request, call_next):
        body = await request.body()
        body_preview = self._serialize_body(body, request.headers.get("content-type"))

        async def receive():
            return {"type": "http.request", "body": body, "more_body": False}

        request = Request(request.scope, receive)

        logger.info("Request: %s %s | body=%s", request.method, request.url, body_preview)
        response = await call_next(request)
        logger.info("Response status: %s", response.status_code)
        return response

app = FastAPI(
    title="Directorio Comercial API",
    description="API robusta y escalable para el marketplace",
    version="2.0.0",
    lifespan=lifespan
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

uploads_dir = Path(__file__).resolve().parents[1] / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Cargar orígenes permitidos desde el entorno; por defecto permite todo en desarrollo
origins_raw = os.environ.get("ALLOWED_ORIGINS", "*")
if origins_raw == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LogMiddleware)


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        # Solo auditar acciones mutativas y búsquedas por ahora
        path = str(request.url.path)
        method = request.method.upper()
        should_audit = method in ("POST", "PUT", "PATCH", "DELETE") or (method == "GET" and "/api/busqueda" in path)

        # Reconstruct body for potential description (preview already implemented)
        body = await request.body()

        # Ejecutar la petición y luego registrar el evento (post-action)
        response = await call_next(request)

        if should_audit:
            # Intentar extraer usuario desde token en cookie o header
            token = None
            try:
                token = request.cookies.get('token') or request.headers.get('Authorization', '').replace('Bearer ', '')
            except Exception:
                token = None

            usuario_id = None
            nombre_usuario = None
            rol_usuario = None
            try:
                if token:
                    payload = pyjwt.decode(token, auth_module.SECRET_KEY, algorithms=[auth_module.ALGORITHM])
                    usuario_id = payload.get('id_usuario') or payload.get('sub')
                    nombre_usuario = payload.get('sub')
                    rol_usuario = payload.get('rol')
            except Exception:
                # No autenticado o token inválido - continuar sin usuario
                usuario_id = None

            ip = request.client.host if getattr(request, 'client', None) else None
            ua = request.headers.get('user-agent')

            # Encolar evento para ser procesado por worker en background
            try:
                queue = getattr(request.app.state, 'audit_queue', None)
                payload = dict(
                    usuario_id=usuario_id,
                    nombre_usuario=nombre_usuario,
                    rol_usuario=rol_usuario,
                    accion=f"{method} {path}",
                    modulo=path.split('/')[2] if len(path.split('/')) > 2 else None,
                    entidad_afectada=None,
                    entidad_id=None,
                    descripcion=(body.decode('utf-8', errors='replace')[:2000] if body else None),
                    metodo_http=method,
                    endpoint=path,
                    ip=ip,
                    user_agent=ua,
                    datos_anteriores=None,
                    datos_nuevos=None,
                    estado_evento=str(response.status_code),
                )
                if queue is not None:
                    await queue.put(payload)
                else:
                    # Fallback if worker not attached: write directly
                    async with async_session() as db_sess:
                        await registrar_auditoria(db_sess, **payload)
            except Exception:
                logger.exception("Error registrando auditoría")

        return response

app.add_middleware(AuditMiddleware)

# Attach background audit worker to app lifecycle
# If AUDIT_REDIS_URL is set, use Redis-backed worker, otherwise use local queue worker
if os.environ.get('AUDIT_REDIS_URL'):
    attach_redis_worker(app)
else:
    attach_queued_worker(app)


# Lista de routers que la aplicación expone en tiempo de importación.
# Incluir routers al importar el módulo permite que los endpoints estén
# disponibles incluso si la fase `startup` tiene problemas con la base de datos
# (útil para tests). El `startup_event` seguirá creando tablas y seed.
routers = [
    ("app.api.auth", "/api", "Autenticación"),
    ("app.api.categorias", "/api", "Categorías"),
    ("app.api.departamentos", "/api", "Departamentos"),
    ("app.api.empresas", "/api", "Empresas"),
    ("app.api.municipios", "/api", "Municipios"),
    ("app.api.publicidad", "/api", "Publicidad"),
    ("app.api.resultados", "/api", "Resultados"),
    ("app.api.review", "/api", "Reviews"),
    ("app.api.usuarios", "/api", "Usuarios"),
    ("app.api.marketplace", "/api", "Marketplace"),
    ("app.api.roles", "/api", "Roles"),
    ("app.api.permisos", "/api", "Permisos"),
    ("app.api.mensajes", "/api", "Mensajes"),
    ("app.api.archivos_mensajes", "/api", "ArchivosMensajes"),
    ("app.api.comprobantes", "/api", "Comprobantes"),
    ("app.api.paises", "/api", "Paises"),
    ("app.api.favoritos", "/api", "Favoritos"),
    ("app.api.busqueda", "/api", "Búsqueda"),
    ("app.api.notificaciones", "/api", "Notificaciones"),
    ("app.api.reportes", "/api", "Reportes"),
    ("app.api.catalogos", "/api", "Catalogos"),
    ("app.api.admin", "/api", "Admin"),
    ("app.api.auditoria", "/api", "Auditoría"),
    ("app.api.tickets", "/api/tickets", "Tickets"),
    ("app.api.backups", "/api", "Backups"),
    ("app.api.health", "", "Health"),
]

for module_path, prefix, tag in routers:
    try:
        logger.info("Importando router %s", module_path)
        module = import_module(module_path)
        router = getattr(module, "router", None)
        if router is None:
            logger.warning("Módulo %s no expone `router`", module_path)
            continue
        app.include_router(router, prefix=prefix, tags=[tag])
        logger.info("Router %s incluido", module_path)
    except Exception as e:
        logger.exception("Error importando/incluyendo %s: %s", module_path, e)
        # No elevar aquí para permitir arrancar la app en entornos sin todas las
        # dependencias; reportamos la excepción y seguimos.


# NOTE: startup/shutdown handled by `lifespan` above (recommended over on_event)


@app.get("/", tags=["root"])
def read_root():
    return {"message": "¡API FastAPI funcionando correctamente!"}


# Manejador de HTTPException para devolver JSON consistente
@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


# Manejador générico para capturar excepciones no controladas
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

