from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, timedelta
from ..core.schemas import Tramite, TramiteCreate, Usuario
from ..core.security import get_current_user
from ..core.database import (
    tramites_collection, tipos_tramite_collection, 
    dependencias_collection, clientes_collection, 
    usuarios_collection, notificaciones_collection
)

router = APIRouter(prefix='/tramites', tags=['Trámites'])

def calcular_estatus_color(fecha_limite: datetime):
    ahora = datetime.utcnow()
    restante = fecha_limite - ahora
    if restante.days < 0:
        return 'vencido', 'red'
    if restante.days <= 3:
        return 'urgente', 'orange'
    if restante.days <= 7:
        return 'proximo', 'yellow'
    return 'pendiente', 'blue'

@router.get('', response_model=List[Tramite])
async def list_tramites(
    tipo: Optional[str] = None,
    estatus: Optional[str] = None,
    cliente: Optional[str] = None,
    current_user: Usuario = Depends(get_current_user)
):
    query = {}
    if tipo: query['tipo_id'] = tipo
    if estatus: query['estatus'] = estatus
    if cliente: query['cliente_id'] = cliente

    cursor = tramites_collection.find(query)
    tramites = []
    async for doc in cursor:
        doc['id'] = str(doc.pop('_id'))
        # Auto-update status based on date
        if doc['estatus'] not in ['completado', 'cancelado']:
            new_estatus, new_color = calcular_estatus_color(doc['fecha_limite'])
            if new_estatus != doc['estatus']:
                doc['estatus'] = new_estatus
                doc['color'] = new_color
                await tramites_collection.update_one({'_id': doc['id']}, {'$set': {'estatus': new_estatus, 'color': new_color}})
        tramites.append(doc)
    return tramites

@router.post('', response_model=Tramite)
async def create_tramite(tramite_in: TramiteCreate, current_user: Usuario = Depends(get_current_user)):
    # 1. Fetch related names
    tipo = await tipos_tramite_collection.find_one({'_id': tramite_in.tipo_id})
    dep = await dependencias_collection.find_one({'_id': tramite_in.dependencia_id})
    cli = await clientes_collection.find_one({'_id': tramite_in.cliente_id})
    asig = await usuarios_collection.find_one({'_id': tramite_in.asignado_a_id})

    if not all([tipo, dep, cli, asig]):
        raise HTTPException(status_code=400, detail='Referencia no válida (tipo, dependencia, cliente o usuario)')

    # 2. Calculate dates
    fecha_creacion = datetime.utcnow()
    fecha_limite = fecha_creacion + timedelta(days=tipo['plazo_dias'])

    estatus, color = calcular_estatus_color(fecha_limite)

    tramite_dict = {
        '_id': str(uuid4()),
        'titulo': tramite_in.titulo,
        'descripcion': tramite_in.descripcion,
        'tipo_id': tramite_in.tipo_id,
        'tipo_nombre': tipo['nombre'],
        'dependencia_id': tramite_in.dependencia_id,
        'dependencia_nombre': dep['nombre'],
        'cliente_id': tramite_in.cliente_id,
        'cliente_nombre': cli['nombre'],
        'estatus': estatus,
        'color': color,
        'prioridad': tramite_in.prioridad,
        'fecha_creacion': fecha_creacion,
        'fecha_limite': fecha_limite,
        'asignado_a_id': tramite_in.asignado_a_id,
        'asignado_a_nombre': asig['nombre'],
        'notas': []
    }

    await tramites_collection.insert_one(tramite_dict)

    # 3. Create notification for assignee
    await notificaciones_collection.insert_one({
        '_id': str(uuid4()),
        'titulo': 'Nuevo trámite asignado',
        'mensaje': f'Se te ha asignado el trámite: {tramite_dict["titulo"]}',
        'usuario_id': tramite_in.asignado_a_id,
        'tipo': 'info',
        'leida': False,
        'fecha': datetime.utcnow(),
        'vinculo': f'/tramites/{tramite_dict["_id"]}'
    })

    tramite_dict['id'] = tramite_dict.pop('_id')
    return tramite_dict

@router.get('/{id}', response_model=Tramite)
async def get_tramite(id: str, current_user: Usuario = Depends(get_current_user)):
    tramite = await tramites_collection.find_one({'_id': id})
    if not tramite:
        raise HTTPException(status_code=404, detail='Trámite no encontrado')
    tramite['id'] = str(tramite.pop('_id'))
    return tramite

@router.put('/{id}', response_model=Tramite)
async def update_tramite(id: str, tramite_in: TramiteCreate, current_user: Usuario = Depends(get_current_user)):
    # Update logic (simplified)
    update_data = tramite_in.dict()
    # Ensure references exist if updated
    result = await tramites_collection.update_one({'_id': id}, {'$set': update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Trámite no encontrado')

    updated = await tramites_collection.find_one({'_id': id})
    updated['id'] = str(updated.pop('_id'))
    return updated

@router.patch('/{id}/estatus', response_model=Tramite)
async def patch_estatus(id: str, estatus: str, color: Optional[str] = None, current_user: Usuario = Depends(get_current_user)):
    update_payload = {'estatus': estatus}
    if color: update_payload['color'] = color

    result = await tramites_collection.update_one({'_id': id}, {'$set': update_payload})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='Trámite no encontrado')

    updated = await tramites_collection.find_one({'_id': id})
    updated['id'] = str(updated.pop('_id'))
    return updated

@router.delete('/{id}')
async def delete_tramite(id: str, current_user: Usuario = Depends(get_current_user)):
    result = await tramites_collection.delete_one({'_id': id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Trámite no encontrado')
    return {'message': 'Trámite eliminado'}
