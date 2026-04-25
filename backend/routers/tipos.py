from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import uuid4
from ..core.schemas import TipoTramite, TipoTramiteCreate, Usuario
from ..core.security import get_current_user
from ..core.database import tipos_tramite_collection

router = APIRouter(prefix='/tipos-tramite', tags=['Tipos de Trámite'])

@router.get('', response_model=List[TipoTramite])
async def list_tipos(current_user: Usuario = Depends(get_current_user)):
    cursor = tipos_tramite_collection.find()
    tipos = []
    async for doc in cursor:
        doc['id'] = str(doc.pop('_id'))
        tipos.append(doc)
    return tipos

@router.post('', response_model=TipoTramite)
async def create_tipo(tipo_in: TipoTramiteCreate, current_user: Usuario = Depends(get_current_user)):
    tipo_dict = tipo_in.dict()
    tipo_dict['_id'] = str(uuid4())
    await tipos_tramite_collection.insert_one(tipo_dict)
    tipo_dict['id'] = tipo_dict.pop('_id')
    return tipo_dict

@router.delete('/{id}')
async def delete_tipo(id: str, current_user: Usuario = Depends(get_current_user)):
    result = await tipos_tramite_collection.delete_one({'_id': id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Tipo no encontrado')
    return {'message': 'Tipo eliminado'}
