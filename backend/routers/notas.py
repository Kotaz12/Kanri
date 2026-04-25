from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import uuid4
from datetime import datetime
from ..core.schemas import Nota, NotaCreate, Usuario
from ..core.security import get_current_user
from ..core.database import tramites_collection

router = APIRouter(prefix='/tramites', tags=['Notas'])

@router.post('/{tramite_id}/notas', response_model=Nota)
async def add_nota(tramite_id: str, nota_in: NotaCreate, current_user: Usuario = Depends(get_current_user)):
    nota_dict = {
        'id': str(uuid4()),
        'contenido': nota_in.contenido,
        'autor_id': current_user['id'],
        'autor_nombre': current_user['nombre'],
        'fecha': datetime.utcnow()
    }

    result = await tramites_collection.update_one(
        {'_id': tramite_id},
        {'$push': {'notas': nota_dict}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Trámite no encontrado')

    return nota_dict

@router.delete('/{tramite_id}/notas/{nota_id}')
async def delete_nota(tramite_id: str, nota_id: str, current_user: Usuario = Depends(get_current_user)):
    result = await tramites_collection.update_one(
        {'_id': tramite_id},
        {'$pull': {'notas': {'id': nota_id}}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Trámite no encontrado')

    return {'message': 'Nota eliminada'}
