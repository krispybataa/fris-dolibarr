import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.app.models import Base

# Hardcode database URL to avoid .env file issues
DATABASE_URL = "postgresql+psycopg2://postgres:$Qlbench3r20@localhost:5432/frisdb"

def setup_database():
    """
    Create all database tables based on SQLAlchemy models.
    """
    # Create database engine
    engine = create_engine(DATABASE_URL)
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        return True
    except SQLAlchemyError as e:
        print(f"Error creating database tables: {str(e)}")
        return False

if __name__ == "__main__":
    setup_database()
