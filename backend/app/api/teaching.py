from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..dependencies import get_db, get_current_user, get_current_admin
from ..models import User, CourseAndSET
from ..schemas import CourseAndSETCreate, CourseAndSETUpdate, CourseAndSETInDB, ApprovalStatusUpdate
from ..utils import save_upload_file, generate_approval_path, json_serialize, update_approval_status, get_overall_approval_status
import json

router = APIRouter()

@router.get("/", response_model=List[CourseAndSETInDB])
async def get_courses(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all courses for the current user.
    """
    courses = db.query(CourseAndSET).filter(
        CourseAndSET.userId == current_user.userId
    ).offset(skip).limit(limit).all()
    
    return courses

@router.get("/{course_id}", response_model=CourseAndSETInDB)
async def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific course by ID.
    """
    course = db.query(CourseAndSET).filter(
        CourseAndSET.caSId == course_id,
        CourseAndSET.userId == current_user.userId
    ).first()
    
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return course

@router.post("/", response_model=CourseAndSETInDB)
async def create_course(
    course_data: CourseAndSETCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new course.
    """
    # Generate approval path
    approval_path = generate_approval_path(
        current_user.department, 
        current_user.college,
        db
    )
    
    # Create course
    db_course = CourseAndSET(
        userId=current_user.userId,
        academicYear=course_data.academicYear,
        term=course_data.term,
        courseNum=course_data.courseNum,
        section=course_data.section,
        courseDesc=course_data.courseDesc,
        courseType=course_data.courseType,
        percentContri=course_data.percentContri,
        loadCreditUnits=course_data.loadCreditUnits,
        noOfRespondents=course_data.noOfRespondents,
        partOneStudent=course_data.partOneStudent,
        partTwoCourse=course_data.partTwoCourse,
        partThreeTeaching=course_data.partThreeTeaching,
        teachingPoints=course_data.teachingPoints,
        supportingDocuments=course_data.supportingDocuments,
        approvalPath=json_serialize(approval_path),
        currentApprover=approval_path[0]["approver_id"] if approval_path else None,
        status="pending"
    )
    
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    
    return db_course

@router.put("/{course_id}", response_model=CourseAndSETInDB)
async def update_course(
    course_id: int,
    course_data: CourseAndSETUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a course.
    """
    db_course = db.query(CourseAndSET).filter(
        CourseAndSET.caSId == course_id,
        CourseAndSET.userId == current_user.userId
    ).first()
    
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Only allow updates if status is not approved
    if db_course.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update an approved course"
        )
    
    # Update course fields
    for key, value in course_data.dict(exclude_unset=True).items():
        setattr(db_course, key, value)
    
    # Reset approval status if content is changed
    if db_course.status == "rejected":
        approval_path = json.loads(db_course.approvalPath) if db_course.approvalPath else []
        
        # Reset all statuses to pending
        for step in approval_path:
            step["status"] = "pending"
        
        db_course.approvalPath = json_serialize(approval_path)
        db_course.currentApprover = approval_path[0]["approver_id"] if approval_path else None
        db_course.status = "pending"
    
    db.commit()
    db.refresh(db_course)
    
    return db_course

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a course.
    """
    db_course = db.query(CourseAndSET).filter(
        CourseAndSET.caSId == course_id,
        CourseAndSET.userId == current_user.userId
    ).first()
    
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Only allow deletion if status is not approved
    if db_course.status == "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an approved course"
        )
    
    # Delete course
    db.delete(db_course)
    db.commit()
    
    return None

@router.post("/{course_id}/upload-document", response_model=CourseAndSETInDB)
async def upload_supporting_document(
    course_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a supporting document for a course.
    """
    db_course = db.query(CourseAndSET).filter(
        CourseAndSET.caSId == course_id,
        CourseAndSET.userId == current_user.userId
    ).first()
    
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Save uploaded file
    file_path = await save_upload_file(file, f"courses/{current_user.userId}")
    
    # Update course with file path
    db_course.supportingDocuments = file_path
    db.commit()
    db.refresh(db_course)
    
    return db_course

# Admin endpoints for approval workflow
@router.get("/pending-approval", response_model=List[CourseAndSETInDB])
async def get_pending_courses(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all courses pending approval by the current user.
    """
    courses = db.query(CourseAndSET).filter(
        CourseAndSET.currentApprover == current_user.userId,
        CourseAndSET.status == "pending"
    ).offset(skip).limit(limit).all()
    
    return courses

@router.put("/{course_id}/approve", response_model=CourseAndSETInDB)
async def approve_course(
    course_id: int,
    approval_data: ApprovalStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Approve or reject a course.
    """
    db_course = db.query(CourseAndSET).filter(
        CourseAndSET.caSId == course_id,
        CourseAndSET.currentApprover == current_user.userId
    ).first()
    
    if db_course is None:
        raise HTTPException(
            status_code=404, 
            detail="Course not found or you are not the current approver"
        )
    
    # Update approval status
    approval_path = json.loads(db_course.approvalPath) if db_course.approvalPath else []
    
    # Find current approver in path
    current_approver_index = -1
    for i, step in enumerate(approval_path):
        if step["approver_id"] == current_user.userId:
            current_approver_index = i
            break
    
    if current_approver_index == -1:
        raise HTTPException(
            status_code=400,
            detail="You are not in the approval path for this course"
        )
    
    # Update status for current approver
    approval_path[current_approver_index]["status"] = approval_data.status
    approval_path[current_approver_index]["comments"] = approval_data.comments
    
    # If rejected, update course status
    if approval_data.status == "rejected":
        db_course.status = "rejected"
        db_course.approvalPath = json_serialize(approval_path)
    else:
        # If approved, check if there are more approvers
        next_approver = None
        for i in range(current_approver_index + 1, len(approval_path)):
            if approval_path[i]["status"] == "pending":
                next_approver = approval_path[i]["approver_id"]
                break
        
        if next_approver:
            # Move to next approver
            db_course.currentApprover = next_approver
        else:
            # All approvers have approved
            db_course.status = "approved"
            db_course.currentApprover = None
        
        db_course.approvalPath = json_serialize(approval_path)
    
    db.commit()
    db.refresh(db_course)
    
    return db_course
