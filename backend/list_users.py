from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.config import settings

# Database connection
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def list_users():
    # Create a session
    db = SessionLocal()
    
    try:
        # Get all users
        users = db.query(User).all()
        
        if not users:
            print("No users found in the database.")
            return
        
        print("\n=== USERS IN DATABASE ===")
        for user in users:
            print(f"Name: {user.userName}")
            print(f"Email: {user.userEmail}")
            print(f"Role: {user.role}")
            print("-" * 30)
            
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
    print("\nTo login with any of these users:")
    print("1. Go to the login page")
    print("2. Enter the email and password (if you know it)")
    print("3. Or use a development token: localStorage.setItem('token', 'dev_admin')")
