from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from uuid import UUID, uuid4

# --- Usuarios ---
class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: str = 'usuario'

class UsuarioCreate(UsuarioBase):
    password: str

class Usuario(UsuarioBase):
    id: str

    class Config:
        from_attributes = True

# --- Clientes ---
class ClienteBase(BaseModel):
    nombre: str
    empresa: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class Cliente(ClienteBase):
    id: str

    class Config:
        from_attributes = True

# --- Tipos de Trámite ---
class TipoTramiteBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    plazo_dias: int
    color: str

class TipoTramiteCreate(TipoTramiteBase):
    pass

class TipoTramite(TipoTramiteBase):
    id: str

    class Config:
        from_attributes = True

# --- Dependencias ---
class DependenciaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    color: str

class DependenciaCreate(DependenciaBase):
    pass

class Dependencia(DependenciaBase):
    id: str

    class Config:
        from_attributes = True

# --- Notas ---
class NotaBase(BaseModel):
    contenido: str
    autor_id: str
    autor_nombre: str
    fecha: datetime = Field(default_factory=datetime.utcnow)

class NotaCreate(BaseModel):
    contenido: str

class Nota(NotaBase):
    id: str

# --- Trámites ---
class TramiteBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    tipo_id: str
    tipo_nombre: str
    dependencia_id: str
    dependencia_nombre: str
    cliente_id: str
    cliente_nombre: str
    estatus: str = 'pendiente'
    color: str = 'gray'
    prioridad: str = 'media'
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_limite: datetime
    asignado_a_id: str
    asignado_a_nombre: str

class TramiteCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    tipo_id: str
    dependencia_id: str
    cliente_id: str
    prioridad: str = 'media'
    asignado_a_id: str

class Tramite(TramiteBase):
    id: str
    notas: List[Nota] = []

    class Config:
        from_attributes = True

# --- Notificaciones ---
class NotificacionBase(BaseModel):
    titulo: str
    mensaje: str
    usuario_id: str
    tipo: str = 'info'
    leida: bool = False
    fecha: datetime = Field(default_factory=datetime.utcnow)
    vinculo: Optional[str] = None

class Notificacion(NotificacionBase):
    id: str

# --- Auth ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Usuario

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
