from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..core.schemas import Notificacion, Usuario
from ..core.security import get_current_user
from ..core.database import notificaciones_collection

router = APIRouter(prefix='/notificaciones', tags=['Notificaciones'])

@router.get('', response_model=List[Notificacion])
async def list_notificaciones(current_user: Usuario = Depends(get_current_user)):
    cursor = notificaciones_collection.find({'usuario_id': current_user['id']}).sort('fecha', -1)
    notifs = []
    async for doc in cursor:
        doc['id'] = str(doc.pop('_id'))
        notifs.append(doc)
    return notifs

@router.patch('/{id}/leer')
async def leer_notificacion(id: str, current_user: Usuario = Depends(get_current_user)):
    result = await notificaciones_collection.update_one(
        {'_id': id, 'usuario_id': current_user['id']},
        {'$set': {'leida': True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Notificación no encontrada')
    return {'message': 'Notificación marcada como leída'}

@router.post('/leer-todas')
async def leer_todas(current_user: Usuario = Depends(get_current_user)):
    await notificaciones_collection.update_many(
        {'usuario_id': current_user['id']},
        {'$set': {'leida': True}}
    )
    return {'message': 'Todas las notificaciones marcadas como leídas'}
