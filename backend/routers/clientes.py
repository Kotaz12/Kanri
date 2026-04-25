from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import uuid4
from ..core.schemas import Cliente, ClienteCreate, Usuario
from ..core.security import get_current_user
from ..core.database import clientes_collection

router = APIRouter(prefix='/clientes', tags=['Clientes'])

@router.get('', response_model=List[Cliente])
async def list_clientes(current_user: Usuario = Depends(get_current_user)):
    cursor = clientes_collection.find()
    clientes = []
    async for doc in cursor:
        doc['id'] = str(doc.pop('_id'))
        clientes.append(doc)
    return clientes

@router.post('', response_model=Cliente)
async def create_cliente(cliente_in: ClienteCreate, current_user: Usuario = Depends(get_current_user)):
    cliente_dict = cliente_in.dict()
    cliente_dict['_id'] = str(uuid4())
    await clientes_collection.insert_one(cliente_dict)
    cliente_dict['id'] = cliente_dict.pop('_id')
    return cliente_dict

@router.get('/{id}', response_model=Cliente)
async def get_cliente(id: str, current_user: Usuario = Depends(get_current_user)):
    cliente = await clientes_collection.find_one({'_id': id})
    if not cliente:
        raise HTTPException(status_code=404, detail='Cliente no encontrado')
    cliente['id'] = str(cliente.pop('_id'))
    return cliente

@router.put('/{id}', response_model=Cliente)
async def update_cliente(id: str, cliente_in: ClienteCreate, current_user: Usuario = Depends(get_current_user)):
    result = await clientes_collection.update_one({'_id': id}, {'$set': cliente_in.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Cliente no encontrado')
    updated = await clientes_collection.find_one({'_id': id})
    updated['id'] = str(updated.pop('_id'))
    return updated

@router.delete('/{id}')
async def delete_cliente(id: str, current_user: Usuario = Depends(get_current_user)):
    result = await clientes_collection.delete_one({'_id': id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Cliente no encontrado')
    return {'message': 'Cliente eliminado'}
