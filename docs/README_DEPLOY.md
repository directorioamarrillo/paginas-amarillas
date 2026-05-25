# Despliegue completo (Postgres, Redis, Backend, Frontend, Worker)

Requisitos:
- Docker y Docker Compose v1.29+
- Opcional: `gh` (GitHub CLI) para crear PRs automáticamente

Pasos rápidos (desarrollo):

1. Construir y levantar todo:

```bash
docker compose -f docker/docker-compose.full.yml up --build
```

2. Ejecutar migraciones (container `migrate` ya hace `alembic upgrade head` en arranque).

3. Variables importantes (usar `server/.env` o `env_file`):
- `DATABASE_URL` o variables de Postgres
- `AUDIT_REDIS_URL` para activar worker Redis

Recomendaciones de optimización para producción:

- Usar `uvicorn` detrás de `gunicorn` con `uvicorn.workers.UvicornWorker` para gestión de procesos.
- Configurar `readiness` y `liveness` probes apuntando a `/health`.
- Fijar recursos en `docker-compose` para `backend` y `audit-worker`.
- Ejecutar `alembic upgrade head` antes de enrutar tráfico al backend.

Ejemplo rápido de healthcheck en `docker-compose`:

```yaml
	backend:
		healthcheck:
			test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
			interval: 30s
			timeout: 5s
			retries: 3
```


Crear rama y PR (desde `server/`):

```bash
./server/scripts/create_pr.sh
# o en Windows PowerShell
.
./server/scripts/create_pr.ps1
```

Si necesitas que ejecute `alembic upgrade head` en tu entorno local, pásame las credenciales de la BD o autoriza la ejecución remota.
