# Módulo de Auditoría

Resumen de endpoints y uso del módulo de auditoría.

Endpoints principales:

- `GET /api/auditoria/` — Lista registros con filtros y paginación.
  - Parámetros: `skip`, `limit`, `fecha_desde`, `fecha_hasta`, `usuario`, `rol`, `accion`, `modulo`, `estado`, `ip`, `q`, `sort`
  - Retorna: `{ total, items: [...] }`

- `GET /api/auditoria/{id}` — Detalle de un registro (solo admin o propietario).

- `GET /api/auditoria/export` — Exportar CSV con filtros (misma lógica de permisos que `GET /api/auditoria/`).

- `GET /api/auditoria/export/pdf` — Exportar PDF (requiere `reportlab` instalado en el servidor).

Notas de seguridad:
- Solo usuarios con rol `ADMIN` pueden ver todos los registros.
- Usuarios con rol `COMERCIANTE` pueden ver registros relacionados con sus empresas/productos/publicidades (cuando existen `entidad_afectada` y `entidad_id`), además de sus propias acciones.
- Usuarios normales solo ven sus propias acciones.
- No existen endpoints para modificar o eliminar registros de auditoría desde la API (solo lectura).

Integración:
- El módulo registra eventos automáticamente desde middleware (POST/PUT/PATCH/DELETE y búsquedas).
- También se instrumentaron manualmente rutas clave: `auth`, `usuarios`, `empresas`, `marketplace`, `publicidades`.

Recomendaciones:
- Añadir instrumentación adicional donde se requiera más contexto (datos anteriores/actuales).
- Para exportar PDF en servidor, instalar `reportlab`:

```bash
pip install reportlab
```

**Fin**

Detalles operativos y despliegue
--------------------------------

- Worker en background: para evitar bloquear las peticiones, el middleware ahora encola los eventos
  y un worker asíncrono los escribe en la base de datos en segundo plano. Esto mejora latencia
  en picos de tráfico y evita commits en el hilo de la petición.

- Requisitos opcionales:
  - `reportlab` para exportar PDF en servidor (opcional). Instalar con `pip install reportlab`.

- Ejecutar pruebas localmente:

```bash
cd server
# activar venv
.\venv\Scripts\activate
pip install -r requirements.txt
pytest -q
```

- Ejecutar seeders (deben configurarse variables de entorno):

```bash
cd server/seeders
python _execute.py
```

- Notas para producción:
  - Limitar `origins` en `api/main.py` en lugar de `*`.
  - Configurar `ALLOWED_HOSTS` y variables de conexión seguras.
  - Considerar externalizar la cola de auditoría (Redis + worker separado) si el volumen crece.

