from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..dependencies import get_db, get_current_user, get_current_admin
from ..models import User, Extension
from ..schemas import ExtensionCreate, ExtensionUpdate, ExtensionInDB, ApprovalStatusUpdate
from ..utils import save_upload_file, generate_approval_path, json_serialize, update_approval_status, get_overall_approval_status
import json

router = APIRouter()

@router.get("/", response_model=List[ExtensionInDB])
async def get_extensions(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all extension activities for the current user.
    """
    extensions = db.query(Extension).filter(
        Extension.userId == current_user.userId
    ).offset(skip).limit(limit).all()
    
    return extensions

@router.get("/{extension_id}", response_model=ExtensionInDB)
async def get_extension(
    extension_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific extension activity by ID.
    """
    extension = db.query(Extension).filter(
        Extension.extensionId == extension_id,
        Extension.userId == current_user.userId
    ).first()
    
    if extension is None:
        raise HTTPException(status_code=404, detail="Extension activity not found")
    
    return extension

@router.post("/", response_model=ExtensionInDB)
async def create_extension(
    extension_data: ExtensionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new extension activity.
    """
    # Generate approval path
    approval_path = generate_approval_path(
        current_user.department, 
        current_user.college,
        db
    )
    
    # Create extension
    db_extension = Extension(
        userId=current_user.userId,
        position=extension_data.position,
        office=extension_data.office,
        startDate=extension_data.startDate,
        endDate=extension_data.endDate,
        number=extension_data.number,
        extOfService=extension_data.extOfService,
        supportingDocument=extension_data.supportingDocument,
        approvalPath=json_serialize(approval_path),
        currentApprover=approval_path[0]["approver_id"] if approval_path else None,
        status="pending"
    )
    
    db.add(db_extension)
    db.commit()
    db.refresh(db_extension)
    
    return db_extension

@router.put("/{extension_id}", response_model=ExtensionInDB)
async def update_extension(
    extension_id: int,
    extension_data: ExtensionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update an extension activity.
    """
    db_extension = db.query(Extension).filter(
        Extension.extensionId == extension_id,
        Extension.userId == current_user.userId
    ).first()
    
    if db_extension is None:
        raise HTTPException(status_code=404, detail="Extension activity not found")
    
    # Only allow updates if status is not approved
    if db_extension.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update an approved extension activity"
        )
    
    # Update extension fields
    for key, value in extension_data.dict(exclude_unset=True).items():
        setattr(db_extension, key, value)
    
    # Reset approval status if content is changed
    if db_extension.status == "rejected":
        approval_path = json.loads(db_extension.approvalPath) if db_extension.approvalPath else []
        
        # Reset all statuses to pending
        for step in approval_path:
            step["status"] = "pending"
        
        db_extension.approvalPath = json_serialize(approval_path)
        db_extension.currentApprover = approval_path[0]["approver_id"] if approval_path else None
        db_extension.status = "pending"
    
    db.commit()
    db.refresh(db_extension)
    
    return db_extension

@router.delete("/{extension_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_extension(
    extension_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an extension activity.
    """
    db_extension = db.query(Extension).filter(
        Extension.extensionId == extension_id,
        Extension.userId == current_user.userId
    ).first()
    
    if db_extension is None:
        raise HTTPException(status_code=404, detail="Extension activity not found")
    
    # Only allow deletion if status is not approved
    if db_extension.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an approved extension activity"
        )
    
    # Delete extension
    db.delete(db_extension)
    db.commit()
    
    return None

@router.post("/{extension_id}/upload-document", response_model=ExtensionInDB)
async def upload_supporting_document(
    extension_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a supporting document for an extension activity.
    """
    db_extension = db.query(Extension).filter(
        Extension.extensionId == extension_id,
        Extension.userId == current_user.userId
    ).first()
    
    if db_extension is None:
        raise HTTPException(status_code=404, detail="Extension activity not found")
    
    # Save uploaded file
    file_path = await save_upload_file(file, f"extensions/{current_user.userId}")
    
    # Update extension with file path
    db_extension.supportingDocument = file_path
    db.commit()
    db.refresh(db_extension)
    
    return db_extension

# Admin endpoints for approval workflow
@router.get("/pending-approval", response_model=List[ExtensionInDB])
async def get_pending_extensions(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all extension activities pending approval by the current user.
    """
    extensions = db.query(Extension).filter(
        Extension.currentApprover == current_user.userId,
        Extension.status == "pending"
    ).offset(skip).limit(limit).all()
    
    return extensions

@router.put("/{extension_id}/approve", response_model=ExtensionInDB)
async def approve_extension(
    extension_id: int,
    approval_data: ApprovalStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Approve or reject an extension activity.
    """
    db_extension = db.query(Extension).filter(
        Extension.extensionId == extension_id,
        Extension.currentApprover == current_user.userId
    ).first()
    
    if db_extension is None:
        raise HTTPException(
            status_code=404, 
            detail="Extension activity not found or you are not the current approver"
        )
    
    # Update approval status
    approval_path = json.loads(db_extension.approvalPath) if db_extension.approvalPath else []
    
    # Find current approver in path
    current_approver_index = -1
    for i, step in enumerate(approval_path):
        if step["approver_id"] == current_user.userId:
            current_approver_index = i
            break
    
    if current_approver_index == -1:
        raise HTTPException(
            status_code=400,
            detail="You are not in the approval path for this extension activity"
        )
    
    # Update status for current approver
    approval_path[current_approver_index]["status"] = approval_data.status
    approval_path[current_approver_index]["comments"] = approval_data.comments
    
    # If rejected, update extension status
    if approval_data.status == "rejected":
        db_extension.status = "rejected"
        db_extension.approvalPath = json_serialize(approval_path)
    else:
        # If approved, check if there are more approvers
        next_approver = None
        for i in range(current_approver_index + 1, len(approval_path)):
            if approval_path[i]["status"] == "pending":
                next_approver = approval_path[i]["approver_id"]
                break
        
        if next_approver:
            # Move to next approver
            db_extension.currentApprover = next_approver
        else:
            # All approvers have approved
            db_extension.status = "approved"
            db_extension.currentApprover = None
        
        db_extension.approvalPath = json_serialize(approval_path)
    
    db.commit()
    db.refresh(db_extension)
    
    return db_extension
