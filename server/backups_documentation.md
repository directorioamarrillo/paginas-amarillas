# Guía de Automatización y Configuración de Backups - Directorio 2.0

Este módulo cuenta con un planificador de copias de seguridad configurable en `server/api/scheduler/backup_scheduler.py`.

## Modos de Ejecución

1. **Forzado / Inmediato**: Ejecuta un backup de la base de datos de manera inmediata sin importar la programación.
   - Script: `server/run_backup_now.bat`
   - Comando CLI: `python api/scheduler/backup_scheduler.py --run-once --force`

2. **Verificación Programada**: Verifica si de acuerdo a la frecuencia configurada (diaria, semanal, mensual) es necesario realizar un backup. Si corresponde, lo ejecuta; de lo contrario, finaliza inmediatamente.
   - Script: `server/run_scheduler.bat`
   - Comando CLI: `python api/scheduler/backup_scheduler.py --run-once`

3. **Modo Servicio (Demonio)**: Se ejecuta de forma continua en segundo plano verificando a intervalos regulares (por defecto cada 1 hora).
   - Comando CLI: `python api/scheduler/backup_scheduler.py --daemon --interval 3600`

---

## Automatización en Servidores

### 1. Configuración en Windows (Programador de Tareas)

Para automatizar las copias de seguridad diarias/semanales/mensuales en Windows:
1. Abra el **Programador de Tareas** (Task Scheduler) de Windows.
2. Haga clic en **Crear Tarea Básica...**
3. Nombre de la tarea: `Directorio2.0-Backups`
4. Desencadenador: Seleccione **Diariamente** (u **Cada hora** usando una tarea avanzada).
5. Acción: Seleccione **Iniciar un programa**.
6. En **Programa o script**, busque y seleccione la ruta completa de su script:
   `C:\ruta\al\proyecto\DIRECTORIO2.0\server\run_scheduler.bat`
7. En **Iniciar en (opcional)**, escriba la ruta del directorio padre del script:
   `C:\ruta\al\proyecto\DIRECTORIO2.0\server`
8. Finalice y guarde la tarea.

### 2. Configuración en Linux (Cron)

Si despliega el servidor en Linux (por ejemplo, Ubuntu Server con MySQL):
1. Abra el editor de tareas cron:
   ```bash
   crontab -e
   ```
2. Añada una línea al final del archivo para programar la verificación cada hora (minuto 0):
   ```bash
   0 * * * * cd /ruta/al/proyecto/DIRECTORIO2.0/server && ./venv/bin/python api/scheduler/backup_scheduler.py --run-once
   ```
3. Guarde y cierre el archivo. El demonio cron ejecutará el script de forma automática cada hora.
