import asyncio
from app.db.conexion import async_session
from app.models.models import Notificacion

async def main():
    async with async_session() as session:
        # Define some mock notifications for user ID 1 (Admin)
        notifications_to_create = [
            {
                "id_usuario_remitente": None, # System notification
                "id_usuario_destinatario": 1,
                "tipo": "nuevo_registro",
                "contenido": "La empresa 'Cafecito Gourmet' se ha registrado exitosamente en la plataforma.",
                "leido": False
            },
            {
                "id_usuario_remitente": None, # System notification
                "id_usuario_destinatario": 1,
                "tipo": "nuevo_producto",
                "contenido": "Un nuevo producto 'Bandeja Paisa Tradicional' ha sido publicado en el marketplace.",
                "leido": False
            },
            {
                "id_usuario_remitente": None, # System notification
                "id_usuario_destinatario": 1,
                "tipo": "nueva_reseña",
                "contenido": "El usuario Luis Lopera ha dejado una reseña de 5 estrellas para 'Dulzura Artesanal'.",
                "leido": False
            },
            {
                "id_usuario_remitente": None, # System notification
                "id_usuario_destinatario": 1,
                "tipo": "sistema",
                "contenido": "Copia de seguridad del sistema generada y verificada automáticamente.",
                "leido": True # Already read
            }
        ]

        for notif in notifications_to_create:
            db_notif = Notificacion(
                id_usuario_remitente=notif["id_usuario_remitente"],
                id_usuario_destinatario=notif["id_usuario_destinatario"],
                tipo=notif["tipo"],
                contenido=notif["contenido"],
                leido=notif["leido"]
            )
            session.add(db_notif)

        await session.commit()
        print("Notificaciones de prueba creadas exitosamente para el Administrador.")

if __name__ == "__main__":
    asyncio.run(main())
