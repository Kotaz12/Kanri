from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .routers import (
    auth, init_data, tramites, notas, 
    clientes, tipos, dependencias, 
    usuarios, notificaciones
)

app = FastAPI(
    title='Kanri API',
    description='Backend para el sistema de gestión de trámites Kanri',
    version='1.0.0'
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Routers
app.include_router(auth.router)
app.include_router(init_data.router)
app.include_router(tramites.router)
app.include_router(notas.router)
app.include_router(clientes.router)
app.include_router(tipos.router)
app.include_router(dependencias.router)
app.include_router(usuarios.router)
app.include_router(notificaciones.router)

@app.get('/')
async def root():
    return {'message': 'Kanri API is running'}
