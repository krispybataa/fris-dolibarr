import os
import uuid
from fastapi import UploadFile, HTTPException
from typing import List, Dict, Any, Optional
import json
from datetime import datetime, date
from .config import settings

# Custom JSON encoder to handle date/datetime objects
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        return super().default(obj)

def json_serialize(obj: Any) -> str:
    """Serialize object to JSON string with custom encoder for dates."""
    return json.dumps(obj, cls=CustomJSONEncoder)

def json_deserialize(json_str: str) -> Any:
    """Deserialize JSON string to object."""
    if not json_str:
        return None
    return json.loads(json_str)

async def save_upload_file(file: UploadFile, directory: str = None) -> str:
    """
    Save an uploaded file to the specified directory.
    
    Args:
        file: The uploaded file
        directory: Directory to save the file in (relative to UPLOAD_DIRECTORY)
        
    Returns:
        Path to the saved file
    """
    if not file:
        return None
        
    # Create base upload directory if it doesn't exist
    base_dir = settings.UPLOAD_DIRECTORY
    os.makedirs(base_dir, exist_ok=True)
    
    # Create subdirectory if specified
    if directory:
        target_dir = os.path.join(base_dir, directory)
        os.makedirs(target_dir, exist_ok=True)
    else:
        target_dir = base_dir
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(target_dir, unique_filename)
    
    # Save file
    try:
        contents = await file.read()
        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=413, detail="File too large")
            
        with open(file_path, "wb") as f:
            f.write(contents)
            
        # Return relative path from upload directory
        if directory:
            return os.path.join(directory, unique_filename)
        return unique_filename
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

def generate_approval_path(department: str, college: str, db) -> List[Dict[str, Any]]:
    """
    Generate approval path for a submission based on department and college.
    
    Args:
        department: User's department
        college: User's college
        db: Database session
        
    Returns:
        List of approval steps with approver IDs and roles
    """
    from .models import ApprovalPath, User
    
    # Query approval path configuration
    approval_paths = db.query(ApprovalPath).filter(
        ApprovalPath.department == department,
        ApprovalPath.college == college
    ).order_by(ApprovalPath.approval_number).all()
    
    if not approval_paths:
        # Fallback to default approval path
        # Find department head and dean
        dept_head = db.query(User).filter(
            User.department == department,
            User.isDepartmentHead == True
        ).first()
        
        dean = db.query(User).filter(
            User.college == college,
            User.isDean == True
        ).first()
        
        approval_path = []
        if dept_head:
            approval_path.append({
                "approver_id": dept_head.userId,
                "role": "Department Head",
                "email": dept_head.userEmail,
                "status": "pending"
            })
        
        if dean:
            approval_path.append({
                "approver_id": dean.userId,
                "role": "Dean",
                "email": dean.userEmail,
                "status": "pending"
            })
            
        return approval_path
    
    # Convert approval paths to list of steps
    approval_path = []
    for path in approval_paths:
        # Find approver user
        approver = db.query(User).filter(User.userEmail == path.approver_email).first()
        if approver:
            role = "Approver"
            if path.isDeptHead:
                role = "Department Head"
            elif path.isDean:
                role = "Dean"
                
            approval_path.append({
                "approver_id": approver.userId,
                "role": role,
                "email": approver.userEmail,
                "status": "pending"
            })
    
    return approval_path

def get_current_approver(approval_path_json: str) -> Optional[int]:
    """
    Get the current approver ID from an approval path JSON string.
    
    Args:
        approval_path_json: JSON string of approval path
        
    Returns:
        Current approver ID or None if no pending approvers
    """
    if not approval_path_json:
        return None
        
    approval_path = json_deserialize(approval_path_json)
    
    for step in approval_path:
        if step["status"] == "pending":
            return step["approver_id"]
    
    return None

def update_approval_status(approval_path_json: str, approver_id: int, status: str) -> str:
    """
    Update the approval status for a specific approver in the approval path.
    
    Args:
        approval_path_json: JSON string of approval path
        approver_id: ID of the approver to update
        status: New status ('approved', 'rejected')
        
    Returns:
        Updated approval path JSON string
    """
    if not approval_path_json:
        return None
        
    approval_path = json_deserialize(approval_path_json)
    
    for step in approval_path:
        if step["approver_id"] == approver_id:
            step["status"] = status
            step["updated_at"] = datetime.utcnow().isoformat()
            break
    
    return json_serialize(approval_path)

def get_overall_approval_status(approval_path_json: str) -> str:
    """
    Get the overall approval status from an approval path.
    
    Args:
        approval_path_json: JSON string of approval path
        
    Returns:
        Overall status ('approved', 'rejected', 'pending')
    """
    if not approval_path_json:
        return "pending"
        
    approval_path = json_deserialize(approval_path_json)
    
    if not approval_path:
        return "pending"
    
    # If any step is rejected, the overall status is rejected
    for step in approval_path:
        if step["status"] == "rejected":
            return "rejected"
    
    # If any step is pending, the overall status is pending
    for step in approval_path:
        if step["status"] == "pending":
            return "pending"
    
    # If all steps are approved, the overall status is approved
    return "approved"
