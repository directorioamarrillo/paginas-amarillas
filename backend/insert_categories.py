import asyncio
from app.db.conexion import async_session
from app.models.models import Categoria
from sqlalchemy.future import select

categorias_data = [
    {"nombre": "☕ Cafetería", "descripcion": "Café, bebidas calientes, jugos, gaseosas, agua y acompañamientos."},
    {"nombre": "🍽️ Restaurantes", "descripcion": "Restaurantes, comidas rápidas, cocina especializada y experiencias gastronómicas."},
    {"nombre": "🥬 Frutas y Verduras", "descripcion": "Frutas, verduras, hortalizas y productos frescos del campo."},
    {"nombre": "🥩 Carnes y Pollo", "descripcion": "Carnes rojas, pollo, embutidos y cortes especiales."},
    {"nombre": "🐟 Pescados y Mariscos", "descripcion": "Pescados frescos, mariscos y productos del mar."},
    {"nombre": "🥛 Lácteos y Huevos", "descripcion": "Leche, quesos, yogures, mantequilla y huevos."},
    {"nombre": "🌾 Granos y Abarrotes", "descripcion": "Arroz, fríjoles, lentejas, harinas y productos básicos de despensa."},
    {"nombre": "🥖 Panadería y Repostería", "descripcion": "Pan fresco, tortas, galletas, postres y productos horneados."},
    {"nombre": "🍲 Comidas Preparadas", "descripcion": "Almuerzos, corrientazos, sopas, antojitos y comidas listas para consumir."},
    {"nombre": "🌶️ Condimentos y Especias", "descripcion": "Hierbas aromáticas, especias, salsas, adobos y sazonadores."},
    {"nombre": "🌱 Productos Orgánicos", "descripcion": "Alimentos naturales, orgánicos y de producción sostenible."},
    {"nombre": "🐾 Mascotas", "descripcion": "Alimentos, accesorios, juguetes y productos para mascotas."},
    {"nombre": "🩺 Salud y Bienestar Animal", "descripcion": "Medicamentos veterinarios, suplementos, insumos clínicos y cuidado preventivo animal."},
    {"nombre": "💊 Droguerías y Farmacia", "descripcion": "Medicamentos, suplementos, productos de cuidado personal y bienestar."},
    {"nombre": "🏥 Salud y Medicina", "descripcion": "Consultorios, clínicas, laboratorios, especialistas y servicios médicos."},
    {"nombre": "💄 Maquillaje y Skincare", "descripcion": "Maquillaje, cuidado facial, productos de belleza y bienestar personal."},
    {"nombre": "💇 Belleza y Estética", "descripcion": "Peluquerías, barberías, spa, uñas y tratamientos estéticos."},
    {"nombre": "🏋️ Deportes y Fitness", "descripcion": "Gimnasios, suplementos deportivos, accesorios y entrenamiento físico."},
    {"nombre": "👗 Moda y Accesorios", "descripcion": "Ropa, calzado, bolsos, joyería y complementos de moda."},
    {"nombre": "🎮 Videojuegos y Gaming", "descripcion": "Consolas, videojuegos, accesorios gamer y artículos coleccionables."},
    {"nombre": "💻 Tecnología", "descripcion": "Computadores, celulares, accesorios electrónicos e innovación tecnológica."},
    {"nombre": "📚 Papelería y Oficina", "descripcion": "Útiles escolares, impresión, suministros y mobiliario de oficina."},
    {"nombre": "🏠 Hogar y Limpieza", "descripcion": "Productos de aseo, organización, decoración y artículos para el hogar."},
    {"nombre": "🔨 Ferretería", "descripcion": "Herramientas, materiales de construcción, pintura y suministros eléctricos."},
    {"nombre": "🔧 Servicios para el Hogar", "descripcion": "Plomería, electricidad, carpintería, mantenimiento y reparaciones."},
    {"nombre": "🏡 Inmobiliaria", "descripcion": "Venta, arriendo y administración de inmuebles y propiedades."},
    {"nombre": "🚚 Servicios Logísticos", "descripcion": "Transporte, mensajería, domicilios y distribución de mercancías."},
    {"nombre": "🎨 Artesanías y Tradicionales", "descripcion": "Productos artesanales, manualidades y artículos típicos de la región."},
    {"nombre": "🍨 Heladería y Postres", "descripcion": "Helados, paletas, postres fríos, tortas y dulces."},
    {"nombre": "🍺 Bar y Licores", "descripcion": "Cervezas, vinos, licores, coctelería y pasabocas."},
    {"nombre": "🏍️ Taller de Motos", "descripcion": "Repuestos, accesorios, mantenimiento y servicios para motocicletas."},
    {"nombre": "🚗 Automotriz", "descripcion": "Repuestos, lubricantes, mantenimiento, talleres y servicios automotrices."},
    {"nombre": "🫧 Autolavado", "descripcion": "Lavado, polichado, detailing y embellecimiento vehicular."},
    {"nombre": "🏨 Hoteles y Hospedaje", "descripcion": "Hoteles, hostales, alojamientos rurales y hospedajes temporales."},
    {"nombre": "🎓 Educación y Capacitación", "descripcion": "Instituciones educativas, cursos, academias y formación profesional."},
    {"nombre": "⚖️ Servicios Profesionales", "descripcion": "Abogados, contadores, consultores, arquitectos e ingenieros."},
    {"nombre": "🎉 Eventos y Entretenimiento", "descripcion": "Organización de eventos, recreación, música, fotografía y actividades culturales."},
    {"nombre": "📢 Publicidad y Marketing", "descripcion": "Diseño gráfico, impresión, marketing digital y promoción comercial."},
    {"nombre": "💼 Empresas y Negocios", "descripcion": "Productos y servicios empresariales, proveedores y soluciones corporativas."},
    {"nombre": "🌐 Telecomunicaciones e Internet", "descripcion": "Servicios de internet, telefonía, redes y conectividad."},
    {"nombre": "🔒 Seguridad y Vigilancia", "descripcion": "Sistemas de seguridad, cámaras, alarmas y vigilancia privada."},
    {"nombre": "🚜 Agroindustria y Campo", "descripcion": "Insumos agrícolas, maquinaria, fertilizantes y producción agropecuaria."},
    {"nombre": "🛋️ Muebles y Decoración", "descripcion": "Muebles, decoración, diseño de interiores y artículos decorativos."},
    {"nombre": "💍 Joyería y Regalos", "descripcion": "Joyas, relojes, detalles personalizados y regalos especiales."},
]

async def seed_categories():
    async with async_session() as db:
        for cat_data in categorias_data:
            nueva_cat = Categoria(nombre=cat_data["nombre"], descripcion=cat_data["descripcion"])
            db.add(nueva_cat)
        await db.commit()
        print(f"Se insertaron {len(categorias_data)} categorías exitosamente.")

if __name__ == "__main__":
    asyncio.run(seed_categories())
