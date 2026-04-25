from fastapi import APIRouter, Depends, HTTPException
from typing import List
from uuid import uuid4
from ..core.schemas import Dependencia, DependenciaCreate, Usuario
from ..core.security import get_current_user
from ..core.database import dependencias_collection

router = APIRouter(prefix='/dependencias', tags=['Dependencias'])

@router.get('', response_model=List[Dependencia])
async def list_dependencias(current_user: Usuario = Depends(get_current_user)):
    cursor = dependencias_collection.find()
    deps = []
    async for doc in cursor:
        doc['id'] = str(doc.pop('_id'))
        deps.append(doc)
    return deps

@router.post('', response_model=Dependencia)
async def create_dependencia(dep_in: DependenciaCreate, current_user: Usuario = Depends(get_current_user)):
    dep_dict = dep_in.dict()
    dep_dict['_id'] = str(uuid4())
    await dependencias_collection.insert_one(dep_dict)
    dep_dict['id'] = dep_dict.pop('_id')
    return dep_dict

@router.delete('/{id}')
async def delete_dependencia(id: str, current_user: Usuario = Depends(get_current_user)):
    result = await dependencias_collection.delete_one({'_id': id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Dependencia no encontrada')
    return {'message': 'Dependencia eliminada'}
