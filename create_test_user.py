import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.app.models import User, Base

# Database connection
DATABASE_URL = "postgresql+psycopg2://postgres:$Qlbench3r20@localhost:5432/frisdb"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_test_user():
    """
    Create a test admin user and a test faculty user in the database.
    """
    db = SessionLocal()
    
    # Check if admin user already exists
    admin_exists = db.query(User).filter(User.userEmail == "admin@example.com").first()
    if not admin_exists:
        # Create admin user
        admin_user = User(
            userName="Admin User",
            userEmail="admin@example.com",
            password=get_password_hash("admin123"),
            rank="Professor",
            college="College of Engineering",
            department="Computer Science",
            role="admin",
            isDepartmentHead=False,
            isDean=False
        )
        
        db.add(admin_user)
        print("Admin user created successfully!")
    else:
        print("Admin user already exists.")
    
    # Check if faculty user already exists
    faculty_exists = db.query(User).filter(User.userEmail == "faculty@example.com").first()
    if not faculty_exists:
        # Create faculty user
        faculty_user = User(
            userName="Faculty User",
            userEmail="faculty@example.com",
            password=get_password_hash("faculty123"),
            rank="Associate Professor",
            college="College of Engineering",
            department="Computer Science",
            role="faculty",
            isDepartmentHead=True,
            isDean=False,
            researchExpDetails="Experienced researcher in AI and machine learning"
        )
        
        db.add(faculty_user)
        print("Faculty user created successfully!")
    else:
        print("Faculty user already exists.")
    
    # Create a dean user
    dean_exists = db.query(User).filter(User.userEmail == "dean@example.com").first()
    if not dean_exists:
        dean_user = User(
            userName="Dean User",
            userEmail="dean@example.com",
            password=get_password_hash("dean123"),
            rank="Professor",
            college="College of Engineering",
            department="Computer Science",
            role="faculty",
            isDepartmentHead=False,
            isDean=True
        )
        
        db.add(dean_user)
        print("Dean user created successfully!")
    else:
        print("Dean user already exists.")
    
    db.commit()
    db.close()
    
    print("Test users setup completed.")

if __name__ == "__main__":
    create_test_user()
