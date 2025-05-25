from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from sqlalchemy.exc import SQLAlchemyError
import logging

from ..dependencies import get_db
from ..schemas import FacultyCreate, FacultyUpdate, FacultyResponse
from ..models import Faculty, User
from ..auth import get_current_user, check_admin_role
from ..services.dolibarr_client import DolibarrClient

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[FacultyResponse])
async def get_all_faculty(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve all faculty profiles.
    """
    # If user is faculty, only return their own profile
    if current_user.role == "faculty":
        if not current_user.faculty_id:
            return []
        faculty = db.query(Faculty).filter(Faculty.id == current_user.faculty_id).all()
    else:
        # Admin can see all faculty
        faculty = db.query(Faculty).offset(skip).limit(limit).all()
    
    return faculty

@router.post("/", response_model=FacultyResponse, status_code=status.HTTP_201_CREATED)
async def create_faculty(
    faculty_in: FacultyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
) -> Any:
    """
    Create new faculty profile (admin only).
    Syncs with Dolibarr as a Third Party.
    """
    # Check if faculty with same email exists
    db_faculty = db.query(Faculty).filter(Faculty.email == faculty_in.email).first()
    if db_faculty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faculty with this email already exists"
        )
    
    # Create faculty in local database
    db_faculty = Faculty(**faculty_in.dict())
    db.add(db_faculty)
    db.commit()
    db.refresh(db_faculty)
    
    # Sync with Dolibarr
    try:
        dolibarr_client = DolibarrClient()
        third_party_data = dolibarr_client.map_faculty_to_third_party(faculty_in.dict())
        
        dolibarr_response = await dolibarr_client.create_third_party(third_party_data)
        
        # Update faculty with Dolibarr ID
        if dolibarr_response and "id" in dolibarr_response:
            db_faculty.dolibarr_id = dolibarr_response["id"]
            db.commit()
            db.refresh(db_faculty)
    except Exception as e:
        logger.error(f"Error syncing faculty to Dolibarr: {str(e)}")
        # Continue even if Dolibarr sync fails
    
    return db_faculty

@router.get("/{faculty_id}", response_model=FacultyResponse)
async def get_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get a specific faculty profile by ID.
    """
    # Check if user has permission to access this faculty
    if current_user.role == "faculty" and current_user.faculty_id != faculty_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if db_faculty is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )
    
    return db_faculty

@router.put("/{faculty_id}", response_model=FacultyResponse)
async def update_faculty(
    faculty_id: int,
    faculty_in: FacultyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a faculty profile.
    Faculty can update their own profile, admin can update any profile.
    Admin updates sync with Dolibarr.
    """
    # Check if user has permission to update this faculty
    if current_user.role == "faculty" and current_user.faculty_id != faculty_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if db_faculty is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )
    
    # Update faculty data
    update_data = faculty_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_faculty, field, value)
    
    db.commit()
    db.refresh(db_faculty)
    
    # Sync with Dolibarr if admin and faculty has dolibarr_id
    if current_user.role == "admin" and db_faculty.dolibarr_id:
        try:
            dolibarr_client = DolibarrClient()
            third_party_data = dolibarr_client.map_faculty_to_third_party(
                {**db_faculty.__dict__, **update_data}
            )
            
            await dolibarr_client.update_third_party(db_faculty.dolibarr_id, third_party_data)
        except Exception as e:
            logger.error(f"Error updating faculty in Dolibarr: {str(e)}")
            # Continue even if Dolibarr sync fails
    
    return db_faculty

@router.delete("/{faculty_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
) -> None:
    """
    Delete a faculty profile (admin only).
    """
    db_faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if db_faculty is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )
    
    # Delete from Dolibarr if has dolibarr_id
    if db_faculty.dolibarr_id:
        try:
            dolibarr_client = DolibarrClient()
            await dolibarr_client.delete_third_party(db_faculty.dolibarr_id)
        except Exception as e:
            logger.error(f"Error deleting faculty from Dolibarr: {str(e)}")
            # Continue even if Dolibarr deletion fails
    
    # Delete from local database
    db.delete(db_faculty)
    db.commit()

@router.post("/{faculty_id}/sync", response_model=FacultyResponse)
async def sync_faculty_with_dolibarr(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
) -> Any:
    """
    Manually sync a faculty profile with Dolibarr (admin only).
    """
    db_faculty = db.query(Faculty).filter(Faculty.id == faculty_id).first()
    if db_faculty is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )
    
    dolibarr_client = DolibarrClient()
    third_party_data = dolibarr_client.map_faculty_to_third_party(db_faculty.__dict__)
    
    try:
        # If faculty already has dolibarr_id, update existing third party
        if db_faculty.dolibarr_id:
            dolibarr_response = await dolibarr_client.update_third_party(
                db_faculty.dolibarr_id, 
                third_party_data
            )
        # Otherwise create new third party
        else:
            dolibarr_response = await dolibarr_client.create_third_party(third_party_data)
            if dolibarr_response and "id" in dolibarr_response:
                db_faculty.dolibarr_id = dolibarr_response["id"]
                db.commit()
                db.refresh(db_faculty)
    except Exception as e:
        logger.error(f"Error syncing faculty with Dolibarr: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error syncing with Dolibarr: {str(e)}"
        )
    
    return db_faculty
