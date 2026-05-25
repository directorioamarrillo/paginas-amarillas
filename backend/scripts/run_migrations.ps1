Param()
Write-Host "Ejecutando migraciones (alembic upgrade head)"
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)
Set-Location ..
if (-not (Test-Path .venv)) {
    Write-Host "No se encontró venv en server/. Crea uno o activa tu entorno." -ForegroundColor Yellow
}
.
\venv\Scripts\python -m alembic upgrade head
Write-Host "Migraciones completadas"
