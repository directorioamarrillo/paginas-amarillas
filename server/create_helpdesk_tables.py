"""Script para crear las tablas de tickets en la BD sin tocar las existentes."""
import sys
sys.path.insert(0, '.')

from api.db.conexion import engine, Base
from api.models.models import Ticket, TicketMensaje, TicketAdjunto, TicketHistorial

# Solo crea las tablas que no existen aún
Base.metadata.create_all(bind=engine, tables=[
    Ticket.__table__,
    TicketMensaje.__table__,
    TicketAdjunto.__table__,
    TicketHistorial.__table__,
])

print("OK - Tablas de helpdesk verificadas/creadas correctamente.")
