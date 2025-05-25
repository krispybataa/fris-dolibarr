from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..dependencies import get_db
from ..auth import authenticate_user, create_access_token
from ..schemas import Token, UserCreate, UserResponse
from ..models import User
from ..auth import get_password_hash
from datetime import timedelta
from ..config import settings

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and provide access token.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.userEmail, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user (public endpoint).
    """
    # Check if user already exists
    db_user = db.query(User).filter(User.userEmail == user_data.userEmail).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with default role as faculty
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        userName=user_data.userName,
        userEmail=user_data.userEmail,
        password=hashed_password,
        rank=user_data.rank,
        college=user_data.college,
        department=user_data.department,
        role="faculty",  # Default role
        researchExpDetails=user_data.researchExpDetails,
        isDepartmentHead=user_data.isDepartmentHead,
        isDean=user_data.isDean,
        googleScholarLink=user_data.googleScholarLink
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user
