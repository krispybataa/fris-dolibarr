from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User, Base
from app.auth import get_password_hash
from app.config import settings

# Database connection
DATABASE_URL = settings.DATABASE_URL
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_test_users():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = SessionLocal()
    
    try:
        # Define test users with different roles
        test_users = [
            {
                "userName": "Admin User",
                "userEmail": "admin@upm.edu.ph",
                "password": "admin123",
                "role": "admin",
                "college": "College of Medicine",
                "department": "Department of Biochemistry",
                "isDepartmentHead": False,
                "isDean": False
            },
            {
                "userName": "Faculty User",
                "userEmail": "faculty@upm.edu.ph",
                "password": "faculty123",
                "role": "faculty",
                "college": "College of Medicine",
                "department": "Department of Biochemistry",
                "isDepartmentHead": False,
                "isDean": False
            },
            {
                "userName": "Department Head",
                "userEmail": "dept_head@upm.edu.ph",
                "password": "dept123",
                "role": "faculty",
                "college": "College of Medicine",
                "department": "Department of Biochemistry",
                "isDepartmentHead": True,
                "isDean": False
            },
            {
                "userName": "Dean User",
                "userEmail": "dean@upm.edu.ph",
                "password": "dean123",
                "role": "faculty",
                "college": "College of Medicine",
                "department": "Department of Biochemistry",
                "isDepartmentHead": False,
                "isDean": True
            }
        ]
        
        # Create or update each test user
        for user_data in test_users:
            # Check if user already exists
            existing_user = db.query(User).filter(User.userEmail == user_data["userEmail"]).first()
            
            if existing_user:
                print(f"Updating existing user: {user_data['userEmail']}")
                
                # Update user attributes
                existing_user.userName = user_data["userName"]
                existing_user.role = user_data["role"]
                existing_user.college = user_data["college"]
                existing_user.department = user_data["department"]
                existing_user.isDepartmentHead = user_data["isDepartmentHead"]
                existing_user.isDean = user_data["isDean"]
                
                # Only update password if it has changed
                if not existing_user.password or len(existing_user.password) < 20:  # Rough check if it's not a bcrypt hash
                    existing_user.password = get_password_hash(user_data["password"])
            else:
                print(f"Creating new user: {user_data['userEmail']}")
                
                # Create new user
                new_user = User(
                    userName=user_data["userName"],
                    userEmail=user_data["userEmail"],
                    password=get_password_hash(user_data["password"]),
                    role=user_data["role"],
                    college=user_data["college"],
                    department=user_data["department"],
                    isDepartmentHead=user_data["isDepartmentHead"],
                    isDean=user_data["isDean"]
                )
                db.add(new_user)
        
        # Commit changes
        db.commit()
        
        # Print available login credentials
        print("\n=== TEST USER CREDENTIALS ===")
        for user_data in test_users:
            print(f"\nRole: {user_data['role'].upper()}")
            if user_data["isDepartmentHead"]:
                print("Position: Department Head")
            elif user_data["isDean"]:
                print("Position: Dean")
            print(f"Email: {user_data['userEmail']}")
            print(f"Password: {user_data['password']}")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
    print("\nTest users have been created. You can now log in with these credentials.")
