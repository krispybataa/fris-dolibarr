from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from .config import settings
from .schemas import TokenData
from typing import Generator, Optional
import os

# Database connection - use environment variable or fallback to hardcoded value
try:
    SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
except Exception as e:
    print(f"Warning: Using hardcoded database URL: {e}")
    SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://postgres:$Qlbench3r20@localhost:5432/frisdb"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# Dependency to get DB session
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Get current user from token
async def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    print(f"\n=== AUTH DEBUG ===\nReceived token: {token[:20]}...\nToken length: {len(token)}\n")
    
    # Development mode - accept simple tokens for testing
    if token and token.startswith('dev_'):
        role = token.split('_')[1] if len(token.split('_')) > 1 else 'user'
        print(f"DEV MODE: Using development token with role: {role}")
        
        # For development, use a fixed email based on role
        email = f"{role}@upm.edu.ph"
        
        # Get or create user for this role
        from .models import User
        user = db.query(User).filter(User.userEmail == email).first()
        
        if not user:
            # Create a placeholder user for development
            from .auth import get_password_hash
            user = User(
                userName=f"{role.capitalize()} User",
                userEmail=email,
                password=get_password_hash("password"),
                role=role,
                college="College of Medicine",
                department="Department of Biochemistry",
                isDepartmentHead=False,
                isDean=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created development user: {user.userName}, role: {user.role}")
        
        print(f"Authenticated with development token: {user.userName}, {user.role}")
        return user
    
    # Production mode - validate JWT token
    try:
        # Get the secret key from settings
        secret_key = settings.SECRET_KEY
        algorithm = settings.ALGORITHM
        
        print(f"Attempting JWT validation with SECRET_KEY: {secret_key[:5]}...\nAlgorithm: {algorithm}")
        
        try:
            # Decode the JWT token
            print(f"About to decode token: {token[:20]}...")
            # Try with more lenient options first for debugging
            try:
                payload = jwt.decode(token, secret_key, algorithms=[algorithm])
            except Exception as decode_error:
                print(f"Standard decode failed: {str(decode_error)}. Trying with more lenient options...")
                # Try with more lenient options
                payload = jwt.decode(
                    token, 
                    secret_key, 
                    algorithms=[algorithm],
                    options={"verify_exp": False}  # Skip expiration verification
                )
                print("WARNING: Using token with expired validation disabled")
            
            print(f"JWT decoded successfully. Payload: {payload}")
            
            email: str = payload.get("sub")
            role: str = payload.get("role")
            
            if email is None:
                print("JWT missing 'sub' claim")
                raise credentials_exception
                
            token_data = TokenData(userEmail=email, role=role)
            
            # Get user from database
            from .models import User
            user = db.query(User).filter(User.userEmail == token_data.userEmail).first()
            
            if user is None:
                print(f"User not found for email: {token_data.userEmail}")
                raise credentials_exception
            
            print(f"Authenticated user: {user.userName}, role: {user.role}")
            return user
            
        except JWTError as e:
            print(f"JWT validation error: {str(e)}")
            # Try to decode without verification for debugging
            try:
                debug_payload = jwt.decode(token, options={"verify_signature": False})
                print(f"Token structure (unverified): {debug_payload}")
            except Exception as debug_e:
                print(f"Could not decode token structure: {str(debug_e)}")
            raise credentials_exception
            
    except Exception as e:
        print(f"Authentication error: {str(e)}")
        raise credentials_exception

# Check if user is admin
async def get_current_admin(current_user = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return current_user
