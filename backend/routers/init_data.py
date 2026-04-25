from fastapi import APIRouter, HTTPException
from uuid import uuid4
from datetime import datetime, timedelta
from ..core.database import (
    usuarios_collection, tipos_tramite_collection, 
    dependencias_collection, db
)
from ..core.security import get_password_hash

router = APIRouter(prefix='/api/init-data', tags=['Utilidades'])

@router.post('/seed')
async def seed_data():
    # 1. Admin user
    admin_email = 'admin@kanri.com'
    existing_admin = await usuarios_collection.find_one({'email': admin_email})
    if not existing_admin:
        admin_user = {
            '_id': str(uuid4()),
            'nombre': 'Administrador',
            'email': admin_email,
            'password': get_password_hash('adminpass'),
            'rol': 'admin'
        }
        await usuarios_collection.insert_one(admin_user)

    # 2. Tipos de trámite
    tipos = [
        {'nombre': 'Escrituración', 'descripcion': 'Proceso de firma de escrituras', 'plazo_dias': 15, 'color': 'blue'},
        {'nombre': 'Cancelación de Hipoteca', 'descripcion': 'Liberación de gravamen', 'plazo_dias': 20, 'color': 'green'},
        {'nombre': 'Poder Notarial', 'descripcion': 'Otorgamiento de facultades', 'plazo_dias': 5, 'color': 'purple'}
    ]
    for t in tipos:
        if not await tipos_tramite_collection.find_one({'nombre': t['nombre']}):
            t['_id'] = str(uuid4())
            await tipos_tramite_collection.insert_one(t)

    # 3. Dependencias
    dependencias = [
        {'nombre': 'Notaría 123', 'descripcion': 'Notaría principal de la zona', 'color': 'indigo'},
        {'nombre': 'Registro Público', 'descripcion': 'Oficina registral', 'color': 'amber'},
        {'nombre': 'Catastro', 'descripcion': 'Valuación inmobiliaria', 'color': 'rose'}
    ]
    for d in dependencias:
        if not await dependencias_collection.find_one({'nombre': d['nombre']}):
            d['_id'] = str(uuid4())
            await dependencias_collection.insert_one(d)

    return {'message': 'Datos iniciales creados correctamente'}

@router.get('/health')
async def health_check():
    return {'status': 'ok', 'timestamp': datetime.utcnow()}
