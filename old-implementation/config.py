from pydantic import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:$Qlbench3r20@localhost:5432/frisdb")
    
    # Dolibarr API settings
    DOLIBARR_API_URL: str = os.getenv("DOLIBARR_API_URL", "https://wantwofrisky.with5.dolicloud.com/api/index.php")
    DOLIBARR_API_KEY: str = os.getenv("DOLIBARR_API_KEY", "CZefWiUPr47K38s0cw6BD0L0xwqrJG19")
    
    # JWT Authentication settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "bXxdsZkrcRg5Xj948ea11g6KlPrkmFCr7DWli3_68uE")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Application settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "FRIS Webapp"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create a global settings object
settings = Settings()
