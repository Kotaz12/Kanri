from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..core.schemas import Usuario, UsuarioBase, UsuarioCreate
from ..core.security import get_current_user, get_password_hash
from ..core.database import usuarios_collection

router = APIRouter(prefix='/usuarios', tags=['Usuarios'])

@router.get('', response_model=List[Usuario])
async def list_usuarios(current_user: Usuario = Depends(get_current_user)):
    cursor = usuarios_collection.find()
    users = []
    async for doc in cursor:
        doc['id'] = str(doc.pop('_id'))
        # Remove password before sending
        doc.pop('password', None)
        users.append(doc)
    return users

@router.get('/me', response_model=Usuario)
async def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user
