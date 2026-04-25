import motor.motor_asyncio
from .config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DB_NAME]

# Collections
usuarios_collection = db.get_collection('usuarios')
clientes_collection = db.get_collection('clientes')
tipos_tramite_collection = db.get_collection('tipos_tramite')
dependencias_collection = db.get_collection('dependencias')
tramites_collection = db.get_collection('tramites')
notas_collection = db.get_collection('notas')
notificaciones_collection = db.get_collection('notificaciones')

async def check_db_connection():
    try:
        await client.admin.command('ping')
        return True
    except Exception:
        return False
