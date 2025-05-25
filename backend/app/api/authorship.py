from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..dependencies import get_db, get_current_user, get_current_admin
from ..models import User, Authorship
from ..schemas import AuthorshipCreate, AuthorshipUpdate, AuthorshipInDB, ApprovalStatusUpdate
from ..utils import save_upload_file, generate_approval_path, json_serialize, update_approval_status, get_overall_approval_status
import json

router = APIRouter()

@router.get("/", response_model=List[AuthorshipInDB])
async def get_authorships(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all authorship records for the current user.
    """
    authorships = db.query(Authorship).filter(
        Authorship.userId == current_user.userId
    ).offset(skip).limit(limit).all()
    
    return authorships

@router.get("/{authorship_id}", response_model=AuthorshipInDB)
async def get_authorship(
    authorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific authorship record by ID.
    """
    authorship = db.query(Authorship).filter(
        Authorship.authorId == authorship_id,
        Authorship.userId == current_user.userId
    ).first()
    
    if authorship is None:
        raise HTTPException(status_code=404, detail="Authorship record not found")
    
    return authorship

@router.post("/", response_model=AuthorshipInDB)
async def create_authorship(
    authorship_data: AuthorshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new authorship record.
    """
    # Generate approval path
    approval_path = generate_approval_path(
        current_user.department, 
        current_user.college,
        db
    )
    
    # Create authorship
    db_authorship = Authorship(
        userId=current_user.userId,
        title=authorship_data.title,
        authors=authorship_data.authors,
        date=authorship_data.date,
        upCourse=authorship_data.upCourse,
        recommendingUnit=authorship_data.recommendingUnit,
        publisher=authorship_data.publisher,
        authorshipType=authorship_data.authorshipType,
        numberOfAuthors=authorship_data.numberOfAuthors,
        supportingDocument=authorship_data.supportingDocument,
        approvalPath=json_serialize(approval_path),
        currentApprover=approval_path[0]["approver_id"] if approval_path else None,
        status="pending"
    )
    
    db.add(db_authorship)
    db.commit()
    db.refresh(db_authorship)
    
    return db_authorship

@router.put("/{authorship_id}", response_model=AuthorshipInDB)
async def update_authorship(
    authorship_id: int,
    authorship_data: AuthorshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an authorship record.
    """
    db_authorship = db.query(Authorship).filter(
        Authorship.authorId == authorship_id,
        Authorship.userId == current_user.userId
    ).first()
    
    if db_authorship is None:
        raise HTTPException(status_code=404, detail="Authorship record not found")
    
    # Only allow updates if status is not approved
    if db_authorship.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update an approved authorship record"
        )
    
    # Update authorship fields
    for key, value in authorship_data.dict(exclude_unset=True).items():
        setattr(db_authorship, key, value)
    
    # Reset approval status if content is changed
    if db_authorship.status == "rejected":
        approval_path = json.loads(db_authorship.approvalPath) if db_authorship.approvalPath else []
        
        # Reset all statuses to pending
        for step in approval_path:
            step["status"] = "pending"
        
        db_authorship.approvalPath = json_serialize(approval_path)
        db_authorship.currentApprover = approval_path[0]["approver_id"] if approval_path else None
        db_authorship.status = "pending"
    
    db.commit()
    db.refresh(db_authorship)
    
    return db_authorship

@router.delete("/{authorship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_authorship(
    authorship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an authorship record.
    """
    db_authorship = db.query(Authorship).filter(
        Authorship.authorId == authorship_id,
        Authorship.userId == current_user.userId
    ).first()
    
    if db_authorship is None:
        raise HTTPException(status_code=404, detail="Authorship record not found")
    
    # Only allow deletion if status is not approved
    if db_authorship.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an approved authorship record"
        )
    
    # Delete authorship
    db.delete(db_authorship)
    db.commit()
    
    return None

@router.post("/{authorship_id}/upload-document", response_model=AuthorshipInDB)
async def upload_supporting_document(
    authorship_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a supporting document for an authorship record.
    """
    db_authorship = db.query(Authorship).filter(
        Authorship.authorId == authorship_id,
        Authorship.userId == current_user.userId
    ).first()
    
    if db_authorship is None:
        raise HTTPException(status_code=404, detail="Authorship record not found")
    
    # Save uploaded file
    file_path = await save_upload_file(file, f"authorships/{current_user.userId}")
    
    # Update authorship with file path
    db_authorship.supportingDocument = file_path
    db.commit()
    db.refresh(db_authorship)
    
    return db_authorship

# Admin endpoints for approval workflow
@router.get("/pending-approval", response_model=List[AuthorshipInDB])
async def get_pending_authorships(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all authorship records pending approval by the current user.
    """
    authorships = db.query(Authorship).filter(
        Authorship.currentApprover == current_user.userId,
        Authorship.status == "pending"
    ).offset(skip).limit(limit).all()
    
    return authorships

@router.put("/{authorship_id}/approve", response_model=AuthorshipInDB)
async def approve_authorship(
    authorship_id: int,
    approval_data: ApprovalStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Approve or reject an authorship record.
    """
    db_authorship = db.query(Authorship).filter(
        Authorship.authorId == authorship_id,
        Authorship.currentApprover == current_user.userId
    ).first()
    
    if db_authorship is None:
        raise HTTPException(
            status_code=404, 
            detail="Authorship record not found or you are not the current approver"
        )
    
    # Update approval status
    approval_path = json.loads(db_authorship.approvalPath) if db_authorship.approvalPath else []
    
    # Find current approver in path
    current_approver_index = -1
    for i, step in enumerate(approval_path):
        if step["approver_id"] == current_user.userId:
            current_approver_index = i
            break
    
    if current_approver_index == -1:
        raise HTTPException(
            status_code=400,
            detail="You are not in the approval path for this authorship record"
        )
    
    # Update status for current approver
    approval_path[current_approver_index]["status"] = approval_data.status
    approval_path[current_approver_index]["comments"] = approval_data.comments
    
    # If rejected, update authorship status
    if approval_data.status == "rejected":
        db_authorship.status = "rejected"
        db_authorship.approvalPath = json_serialize(approval_path)
    else:
        # If approved, check if there are more approvers
        next_approver = None
        for i in range(current_approver_index + 1, len(approval_path)):
            if approval_path[i]["status"] == "pending":
                next_approver = approval_path[i]["approver_id"]
                break
        
        if next_approver:
            # Move to next approver
            db_authorship.currentApprover = next_approver
        else:
            # All approvers have approved
            db_authorship.status = "approved"
            db_authorship.currentApprover = None
        
        db_authorship.approvalPath = json_serialize(approval_path)
    
    db.commit()
    db.refresh(db_authorship)
    
    return db_authorship
