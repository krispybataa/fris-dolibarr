from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..dependencies import get_db, get_current_user, get_current_admin
from ..models import User, ApprovalPath
from ..schemas import ApprovalPathCreate, ApprovalPathUpdate, ApprovalPathInDB
import json

router = APIRouter()

@router.get("/paths", response_model=List[ApprovalPathInDB])
async def get_approval_paths(
    department: str = None,
    college: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Get all approval paths (admin only).
    Filter by department and/or college if provided.
    """
    query = db.query(ApprovalPath)
    
    if department:
        query = query.filter(ApprovalPath.department == department)
    
    if college:
        query = query.filter(ApprovalPath.college == college)
    
    paths = query.order_by(ApprovalPath.department, ApprovalPath.college, ApprovalPath.approval_number).offset(skip).limit(limit).all()
    
    return paths

@router.post("/paths", response_model=ApprovalPathInDB)
async def create_approval_path(
    path_data: ApprovalPathCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Create a new approval path (admin only).
    """
    # Check if approver email exists
    approver = db.query(User).filter(User.userEmail == path_data.approver_email).first()
    if not approver:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approver email does not exist in the system"
        )
    
    # Create approval path
    db_path = ApprovalPath(
        department=path_data.department,
        college=path_data.college,
        approver_email=path_data.approver_email,
        approval_number=path_data.approval_number,
        isDeptHead=path_data.isDeptHead,
        isDean=path_data.isDean
    )
    
    db.add(db_path)
    db.commit()
    db.refresh(db_path)
    
    return db_path

@router.put("/paths/{path_id}", response_model=ApprovalPathInDB)
async def update_approval_path(
    path_id: int,
    path_data: ApprovalPathUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Update an approval path (admin only).
    """
    db_path = db.query(ApprovalPath).filter(ApprovalPath.approvalPathId == path_id).first()
    
    if db_path is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval path not found"
        )
    
    # Check if approver email exists if it's being updated
    if path_data.approver_email:
        approver = db.query(User).filter(User.userEmail == path_data.approver_email).first()
        if not approver:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Approver email does not exist in the system"
            )
    
    # Update fields
    for key, value in path_data.dict(exclude_unset=True).items():
        setattr(db_path, key, value)
    
    db.commit()
    db.refresh(db_path)
    
    return db_path

@router.delete("/paths/{path_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_approval_path(
    path_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Delete an approval path (admin only).
    """
    db_path = db.query(ApprovalPath).filter(ApprovalPath.approvalPathId == path_id).first()
    
    if db_path is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval path not found"
        )
    
    db.delete(db_path)
    db.commit()
    
    return None

@router.get("/pending", response_model=Dict[str, List[Dict[str, Any]]])
async def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all items pending approval by the current user.
    Returns a dictionary with categories of pending items.
    """
    # Get all types of items pending approval
    from ..models import ResearchActivities, CourseAndSET, Extension, Authorship
    
    # Research activities
    research_activities = db.query(ResearchActivities).filter(
        ResearchActivities.currentApprover == current_user.userId,
        ResearchActivities.status == "pending"
    ).all()
    
    # Courses and SET
    courses = db.query(CourseAndSET).filter(
        CourseAndSET.currentApprover == current_user.userId,
        CourseAndSET.status == "pending"
    ).all()
    
    # Extensions
    extensions = db.query(Extension).filter(
        Extension.currentApprover == current_user.userId,
        Extension.status == "pending"
    ).all()
    
    # Authorships
    authorships = db.query(Authorship).filter(
        Authorship.currentApprover == current_user.userId,
        Authorship.status == "pending"
    ).all()
    
    # Format response
    result = {
        "research_activities": [
            {
                "id": item.raId,
                "title": item.title,
                "type": "research_activity",
                "submitter_id": item.userId,
                "submitter_name": db.query(User).filter(User.userId == item.userId).first().userName,
                "date_submitted": item.created_at.isoformat()
            }
            for item in research_activities
        ],
        "courses": [
            {
                "id": item.caSId,
                "title": f"{item.courseNum} - {item.courseDesc}",
                "type": "course",
                "submitter_id": item.userId,
                "submitter_name": db.query(User).filter(User.userId == item.userId).first().userName,
                "date_submitted": item.created_at.isoformat()
            }
            for item in courses
        ],
        "extensions": [
            {
                "id": item.extensionId,
                "title": f"{item.position} at {item.office}",
                "type": "extension",
                "submitter_id": item.userId,
                "submitter_name": db.query(User).filter(User.userId == item.userId).first().userName,
                "date_submitted": item.created_at.isoformat()
            }
            for item in extensions
        ],
        "authorships": [
            {
                "id": item.authorId,
                "title": item.title,
                "type": "authorship",
                "submitter_id": item.userId,
                "submitter_name": db.query(User).filter(User.userId == item.userId).first().userName,
                "date_submitted": item.created_at.isoformat()
            }
            for item in authorships
        ]
    }
    
    return result

@router.get("/my-submissions", response_model=Dict[str, List[Dict[str, Any]]])
async def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all submissions by the current user with their approval status.
    """
    # Get all types of submissions
    from ..models import ResearchActivities, CourseAndSET, Extension, Authorship
    
    # Research activities
    research_activities = db.query(ResearchActivities).filter(
        ResearchActivities.userId == current_user.userId
    ).all()
    
    # Courses and SET
    courses = db.query(CourseAndSET).filter(
        CourseAndSET.userId == current_user.userId
    ).all()
    
    # Extensions
    extensions = db.query(Extension).filter(
        Extension.userId == current_user.userId
    ).all()
    
    # Authorships
    authorships = db.query(Authorship).filter(
        Authorship.userId == current_user.userId
    ).all()
    
    # Format response
    result = {
        "research_activities": [
            {
                "id": item.raId,
                "title": item.title,
                "type": "research_activity",
                "status": item.status,
                "date_submitted": item.created_at.isoformat(),
                "current_approver": get_approver_name(db, item.currentApprover) if item.currentApprover else None
            }
            for item in research_activities
        ],
        "courses": [
            {
                "id": item.caSId,
                "title": f"{item.courseNum} - {item.courseDesc}",
                "type": "course",
                "status": item.status,
                "date_submitted": item.created_at.isoformat(),
                "current_approver": get_approver_name(db, item.currentApprover) if item.currentApprover else None
            }
            for item in courses
        ],
        "extensions": [
            {
                "id": item.extensionId,
                "title": f"{item.position} at {item.office}",
                "type": "extension",
                "status": item.status,
                "date_submitted": item.created_at.isoformat(),
                "current_approver": get_approver_name(db, item.currentApprover) if item.currentApprover else None
            }
            for item in extensions
        ],
        "authorships": [
            {
                "id": item.authorId,
                "title": item.title,
                "type": "authorship",
                "status": item.status,
                "date_submitted": item.created_at.isoformat(),
                "current_approver": get_approver_name(db, item.currentApprover) if item.currentApprover else None
            }
            for item in authorships
        ]
    }
    
    return result

def get_approver_name(db: Session, approver_id: int) -> str:
    """Helper function to get approver name from ID."""
    if not approver_id:
        return None
        
    approver = db.query(User).filter(User.userId == approver_id).first()
    return approver.userName if approver else None
