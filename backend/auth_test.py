from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Base
from app.auth import get_password_hash, create_access_token
from app.config import settings
from datetime import timedelta
import json

# Database connection
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def setup_test_user():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = SessionLocal()
    
    try:
        # Create test user
        email = "admin@upm.edu.ph"
        password = "admin123"
        
        # Check if user already exists
        user = db.query(User).filter(User.userEmail == email).first()
        if not user:
            # Create new user
            hashed_password = get_password_hash(password)
            user = User(
                userName="Admin User",
                userEmail=email,
                password=hashed_password,
                role="admin",
                college="College of Medicine",
                department="Department of Biochemistry",
                isDepartmentHead=False,
                isDean=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created user: {user.userEmail}")
        else:
            print(f"User already exists: {user.userEmail}")
        
        # Generate JWT token
        token_data = {"sub": user.userEmail, "role": user.role}
        token = create_access_token(
            data=token_data,
            expires_delta=timedelta(days=30)  # Long expiration for testing
        )
        
        print("\n=== AUTHENTICATION OPTIONS ===")
        print("\n1. JWT TOKEN (Valid for 30 days):")
        print(token)
        print("\nTo use this token in your browser:")
        print("localStorage.setItem('token', '" + token + "');")
        
        print("\n2. DEVELOPMENT TOKEN:")
        print("dev_admin")
        print("\nTo use this token in your browser:")
        print("localStorage.setItem('token', 'dev_admin');")
        
        print("\n3. LOGIN CREDENTIALS:")
        print(f"Email: {email}")
        print(f"Password: {password}")
        
    finally:
        db.close()

if __name__ == "__main__":
    setup_test_user()
