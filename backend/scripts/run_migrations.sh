#!/usr/bin/env bash
set -euo pipefail
echo "Ejecutando migraciones (alembic upgrade head)"
cd "$(dirname "$0")/.."
if [ ! -d ".venv" ]; then
  echo "No se detectó .venv en server/. Asegúrate de activar tu entorno virtual antes." >&2
fi
./venv/bin/python -m alembic upgrade head
echo "Migraciones completadas"
