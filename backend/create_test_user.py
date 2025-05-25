from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Base
from app.auth import get_password_hash
from app.config import settings

# Database connection
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_test_user():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = SessionLocal()
    
    try:
        # Check if test user already exists
        test_user = db.query(User).filter(User.userEmail == "test@upm.edu.ph").first()
        if test_user:
            print(f"Test user already exists: {test_user.userEmail}")
        else:
            # Create test user
            hashed_password = get_password_hash("test123")
            test_user = User(
                userName="Test User",
                userEmail="test@upm.edu.ph",
                password=hashed_password,
                role="admin",
                college="College of Medicine",
                department="Department of Biochemistry",
                isDepartmentHead=False,
                isDean=False
            )
            
            db.add(test_user)
            db.commit()
            print(f"Created test user: {test_user.userEmail}")
        
        print("\nYou can login with:")
        print("Email: test@upm.edu.ph")
        print("Password: test123")
        print("\nOr use the development token:")
        print("localStorage.setItem('token', 'dev_admin')")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()