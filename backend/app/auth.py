from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .dependencies import get_db
from .models import User
from .schemas import Token, UserCreate, UserResponse
from .config import settings

# Get values from settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, email: str, password: str):
    print(f"\n=== LOGIN ATTEMPT ===\nEmail: {email}")
    
    user = db.query(User).filter(User.userEmail == email).first()
    if not user:
        print(f"User not found with email: {email}")
        return False
    
    print(f"Found user: {user.userName}, Role: {user.role}")
    
    if not verify_password(password, user.password):
        print("Password verification failed")
        return False
    
    print(f"Authentication successful for: {user.userName}, Role: {user.role}")
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    print(f"Token payload before encoding: {to_encode}")
    print(f"Using SECRET_KEY: {SECRET_KEY[:5]}... (length: {len(SECRET_KEY)})")
    print(f"Using ALGORITHM: {ALGORITHM}")
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    # Debug the token
    print(f"Generated token: {encoded_jwt[:20]}... (length: {len(encoded_jwt)})")
    
    # Verify the token can be decoded immediately
    try:
        decoded = jwt.decode(encoded_jwt, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"Token verified successfully: {decoded}")
    except Exception as e:
        print(f"WARNING: Token verification failed immediately after creation: {str(e)}")
    
    return encoded_jwt

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"\n=== LOGIN REQUEST ===\nUsername: {form_data.username}")
    
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        print("Authentication failed - returning 401")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"Creating token for user: {user.userName}, Role: {user.role}")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Create token payload
    token_data = {"sub": user.userEmail, "role": user.role}
    print(f"Token payload: {token_data}")
    
    # Generate token
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )
    
    print(f"Generated token: {access_token[:20]}...")
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.userEmail == user_data.userEmail).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        userName=user_data.userName,
        userEmail=user_data.userEmail,
        password=hashed_password,
        rank=user_data.rank,
        college=user_data.college,
        department=user_data.department,
        role=user_data.role,
        researchExpDetails=user_data.researchExpDetails,
        isDepartmentHead=user_data.isDepartmentHead,
        isDean=user_data.isDean,
        googleScholarLink=user_data.googleScholarLink
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user
