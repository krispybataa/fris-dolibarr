from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..dependencies import get_db, get_current_user, get_current_admin
from ..models import User, ResearchActivities, SDG, SDGSubset
from ..schemas import ResearchActivitiesCreate, ResearchActivitiesUpdate, ResearchActivitiesInDB, ApprovalStatusUpdate
from ..utils import save_upload_file, generate_approval_path, json_serialize, update_approval_status, get_overall_approval_status
import json

router = APIRouter()

@router.get("/", response_model=List[ResearchActivitiesInDB])
async def get_publications(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all publications for the current user.
    """
    publications = db.query(ResearchActivities).filter(
        ResearchActivities.userId == current_user.userId
    ).offset(skip).limit(limit).all()
    
    return publications

@router.get("/{publication_id}", response_model=ResearchActivitiesInDB)
async def get_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific publication by ID.
    """
    publication = db.query(ResearchActivities).filter(
        ResearchActivities.raId == publication_id,
        ResearchActivities.userId == current_user.userId
    ).first()
    
    if publication is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    return publication

@router.post("/", response_model=ResearchActivitiesInDB)
async def create_publication(
    publication_data: ResearchActivitiesCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new publication.
    """
    # Generate approval path
    approval_path = generate_approval_path(
        current_user.department, 
        current_user.college,
        db
    )
    
    # Create publication
    db_publication = ResearchActivities(
        userId=current_user.userId,
        title=publication_data.title,
        institute=publication_data.institute,
        authors=publication_data.authors,
        datePublished=publication_data.datePublished,
        startDate=publication_data.startDate,
        endDate=publication_data.endDate,
        journal=publication_data.journal,
        citedAs=publication_data.citedAs,
        doi=publication_data.doi,
        publicationType=publication_data.publicationType,
        supportingDocument=publication_data.supportingDocument,
        approvalPath=json_serialize(approval_path),
        currentApprover=approval_path[0]["approver_id"] if approval_path else None,
        status="pending"
    )
    
    db.add(db_publication)
    db.commit()
    db.refresh(db_publication)
    
    # Create SDGs if provided
    if publication_data.sdgs:
        for sdg_data in publication_data.sdgs:
            db_sdg = SDG(
                raId=db_publication.raId,
                sdgNum=sdg_data.sdgNum,
                sdgDesc=sdg_data.sdgDesc
            )
            
            db.add(db_sdg)
            db.commit()
            db.refresh(db_sdg)
            
            # Create SDG subsets if provided
            if sdg_data.subsets:
                for subset_data in sdg_data.subsets:
                    db_subset = SDGSubset(
                        sdgId=db_sdg.sdgId,
                        sdgSNum=subset_data.sdgSNum,
                        sdgSDesc=subset_data.sdgSDesc
                    )
                    
                    db.add(db_subset)
                    db.commit()
    
    return db_publication

@router.put("/{publication_id}", response_model=ResearchActivitiesInDB)
async def update_publication(
    publication_id: int,
    publication_data: ResearchActivitiesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a publication.
    """
    db_publication = db.query(ResearchActivities).filter(
        ResearchActivities.raId == publication_id,
        ResearchActivities.userId == current_user.userId
    ).first()
    
    if db_publication is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    # Only allow updates if status is not approved
    if db_publication.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update an approved publication"
        )
    
    # Update publication fields
    for key, value in publication_data.dict(exclude_unset=True).items():
        setattr(db_publication, key, value)
    
    # Reset approval status if content is changed
    if db_publication.status == "rejected":
        approval_path = json.loads(db_publication.approvalPath) if db_publication.approvalPath else []
        
        # Reset all statuses to pending
        for step in approval_path:
            step["status"] = "pending"
        
        db_publication.approvalPath = json_serialize(approval_path)
        db_publication.currentApprover = approval_path[0]["approver_id"] if approval_path else None
        db_publication.status = "pending"
    
    db.commit()
    db.refresh(db_publication)
    
    return db_publication

@router.delete("/{publication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_publication(
    publication_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a publication.
    """
    db_publication = db.query(ResearchActivities).filter(
        ResearchActivities.raId == publication_id,
        ResearchActivities.userId == current_user.userId
    ).first()
    
    if db_publication is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    # Only allow deletion if status is not approved
    if db_publication.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an approved publication"
        )
    
    # Delete associated SDGs and subsets
    sdgs = db.query(SDG).filter(SDG.raId == publication_id).all()
    for sdg in sdgs:
        # Delete subsets
        db.query(SDGSubset).filter(SDGSubset.sdgId == sdg.sdgId).delete()
        
    # Delete SDGs
    db.query(SDG).filter(SDG.raId == publication_id).delete()
    
    # Delete publication
    db.delete(db_publication)
    db.commit()
    
    return None

@router.post("/{publication_id}/upload-document", response_model=ResearchActivitiesInDB)
async def upload_supporting_document(
    publication_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a supporting document for a publication.
    """
    db_publication = db.query(ResearchActivities).filter(
        ResearchActivities.raId == publication_id,
        ResearchActivities.userId == current_user.userId
    ).first()
    
    if db_publication is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    
    # Save uploaded file
    file_path = await save_upload_file(file, f"publications/{current_user.userId}")
    
    # Update publication with file path
    db_publication.supportingDocument = file_path
    db.commit()
    db.refresh(db_publication)
    
    return db_publication

# Admin endpoints for approval workflow
@router.get("/pending-approval", response_model=List[ResearchActivitiesInDB])
async def get_pending_publications(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all publications pending approval by the current user.
    """
    publications = db.query(ResearchActivities).filter(
        ResearchActivities.currentApprover == current_user.userId,
        ResearchActivities.status == "pending"
    ).offset(skip).limit(limit).all()
    
    return publications

@router.put("/{publication_id}/approve", response_model=ResearchActivitiesInDB)
async def approve_publication(
    publication_id: int,
    approval_data: ApprovalStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Approve or reject a publication.
    """
    db_publication = db.query(ResearchActivities).filter(
        ResearchActivities.raId == publication_id,
        ResearchActivities.currentApprover == current_user.userId
    ).first()
    
    if db_publication is None:
        raise HTTPException(
            status_code=404, 
            detail="Publication not found or you are not the current approver"
        )
    
    # Update approval status
    approval_path = json.loads(db_publication.approvalPath) if db_publication.approvalPath else []
    
    # Find current approver in path
    current_approver_index = -1
    for i, step in enumerate(approval_path):
        if step["approver_id"] == current_user.userId:
            current_approver_index = i
            break
    
    if current_approver_index == -1:
        raise HTTPException(
            status_code=400,
            detail="You are not in the approval path for this publication"
        )
    
    # Update status for current approver
    approval_path[current_approver_index]["status"] = approval_data.status
    approval_path[current_approver_index]["comments"] = approval_data.comments
    
    # If rejected, update publication status
    if approval_data.status == "rejected":
        db_publication.status = "rejected"
        db_publication.approvalPath = json_serialize(approval_path)
    else:
        # If approved, check if there are more approvers
        next_approver = None
        for i in range(current_approver_index + 1, len(approval_path)):
            if approval_path[i]["status"] == "pending":
                next_approver = approval_path[i]["approver_id"]
                break
        
        if next_approver:
            # Move to next approver
            db_publication.currentApprover = next_approver
        else:
            # All approvers have approved
            db_publication.status = "approved"
            db_publication.currentApprover = None
        
        db_publication.approvalPath = json_serialize(approval_path)
    
    db.commit()
    db.refresh(db_publication)
    
    return db_publication
