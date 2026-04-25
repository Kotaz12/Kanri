from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from uuid import uuid4
from ..core.schemas import Token, UsuarioCreate, Usuario, LoginRequest
from ..core.security import get_password_hash, verify_password, create_access_token
from ..core.database import usuarios_collection
from ..core.config import settings

router = APIRouter(prefix='/auth', tags=['Autenticación'])

@router.post('/registro', response_model=Usuario)
async def registro(user_in: UsuarioCreate):
    user = await usuarios_collection.find_one({'email': user_in.email})
    if user:
        raise HTTPException(status_code=400, detail='El email ya está registrado')

    user_dict = user_in.dict()
    user_dict['password'] = get_password_hash(user_dict.pop('password'))
    user_dict['_id'] = str(uuid4())

    await usuarios_collection.insert_one(user_dict)
    user_dict['id'] = user_dict['_id']
    return user_dict

@router.post('/login', response_model=Token)
async def login(login_data: LoginRequest):
    user = await usuarios_collection.find_one({'email': login_data.email})
    if not user or not verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail='Email o contraseña incorrectos')

    access_token_expires = timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    access_token = create_access_token(
        data={'sub': user['email']}, expires_delta=access_token_expires
    )

    user['id'] = str(user['_id'])
    return {'access_token': access_token, 'token_type': 'bearer', 'user': user}
