from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
try:
    load_dotenv()
except Exception as e:
    print(f"Warning: Could not load .env file: {e}")
    # Continue without .env file

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:$Qlbench3r20@localhost:5432/frisdb")
    
    # Dolibarr API settings
    DOLIBARR_API_URL: str = os.getenv("DOLIBARR_API_URL", "https://wantwofrisky.with5.dolicloud.com/api/index.php")
    DOLIBARR_API_KEY: str = os.getenv("DOLIBARR_API_KEY", "CZefWiUPr47K38s0cw6BD0L0xwqrJG19")
    
    # JWT Authentication settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dQvotTx5a169qxOpYOvxE12sLTzaRQay14ePtKwlEvM")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # File upload settings
    UPLOAD_DIRECTORY: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    
    # CORS settings
    CORS_ORIGINS: list = ["*"]  # In production, replace with specific origins
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
