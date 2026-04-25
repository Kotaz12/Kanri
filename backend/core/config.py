import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    MONGODB_URL: str = os.getenv('MONGODB_URL', 'mongodb://localhost:27017')
    DB_NAME: str = os.getenv('DB_NAME', 'kanri_db')
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'kanri_super_secret_key_change_in_production')
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    CORS_ORIGINS: List[str] = ['*']

    class Config:
        env_file = '.env'
        extra = 'ignore'


settings = Settings()
