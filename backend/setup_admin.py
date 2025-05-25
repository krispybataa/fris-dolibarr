from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Base
from app.auth import get_password_hash
from app.config import settings

# Database connection
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def setup_admin_user():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin = db.query(User).filter(User.userEmail == "admin@upm.edu.ph").first()
        if admin:
            print(f"Admin user already exists: {admin.userEmail}")
            print("\nYou can login with:")
            print("Email: admin@upm.edu.ph")
            print("Password: admin123")
            return
        
        # Create admin user
        hashed_password = get_password_hash("admin123")
        admin_user = User(
            userName="Admin User",
            userEmail="admin@upm.edu.ph",
            password=hashed_password,
            role="admin",
            college="College of Medicine",
            department="Department of Biochemistry",
            isDepartmentHead=False,
            isDean=False
        )
        
        db.add(admin_user)
        db.commit()
        print(f"Created admin user: {admin_user.userEmail}")
        print("\nYou can login with:")
        print("Email: admin@upm.edu.ph")
        print("Password: admin123")
        
    finally:
        db.close()

if __name__ == "__main__":
    setup_admin_user()
    print("\nNow you can log in through the login page normally.")
    print("No need to manually set tokens in localStorage.")
