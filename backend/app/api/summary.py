from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..dependencies import get_db, get_current_user
from ..models import User, ResearchActivities, CourseAndSET, Extension, Authorship
from ..schemas import RecordSummaryResponse
from typing import List

router = APIRouter()

@router.get("/record-summary", response_model=RecordSummaryResponse)
async def get_record_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"\n=== SUMMARY ENDPOINT ===\nUser: {current_user.userName}, Role: {current_user.role}\n")
    """
    Get summary of user's records (publications, teaching, extensions, authorships)
    """
    try:
        print(f"Querying database for user ID: {current_user.userId}")
        
        # Get counts for each record type
        publications_query = db.query(func.count(ResearchActivities.raId)).filter(
            ResearchActivities.userId == current_user.userId
        )
        publications_count = publications_query.scalar() or 0
        print(f"Publications query: {str(publications_query)}")
        print(f"Publications count: {publications_count}")
        
        teaching_query = db.query(func.count(CourseAndSET.caSId)).filter(
            CourseAndSET.userId == current_user.userId
        )
        teaching_count = teaching_query.scalar() or 0
        print(f"Teaching query: {str(teaching_query)}")
        print(f"Teaching count: {teaching_count}")
        
        extension_query = db.query(func.count(Extension.extensionId)).filter(
            Extension.userId == current_user.userId
        )
        extension_count = extension_query.scalar() or 0
        print(f"Extension query: {str(extension_query)}")
        print(f"Extension count: {extension_count}")
        
        authorship_query = db.query(func.count(Authorship.authorId)).filter(
            Authorship.userId == current_user.userId
        )
        authorship_count = authorship_query.scalar() or 0
        print(f"Authorship query: {str(authorship_query)}")
        print(f"Authorship count: {authorship_count}")
        
        # Get pending counts for each record type
        publications_pending_query = db.query(func.count(ResearchActivities.raId)).filter(
            ResearchActivities.userId == current_user.userId,
            ResearchActivities.status == "pending"
        )
        publications_pending = publications_pending_query.scalar() or 0
        print(f"Publications pending query: {str(publications_pending_query)}")
        print(f"Publications pending count: {publications_pending}")
        
        teaching_pending_query = db.query(func.count(CourseAndSET.caSId)).filter(
            CourseAndSET.userId == current_user.userId,
            CourseAndSET.status == "pending"
        )
        teaching_pending = teaching_pending_query.scalar() or 0
        print(f"Teaching pending query: {str(teaching_pending_query)}")
        print(f"Teaching pending count: {teaching_pending}")
        
        extension_pending_query = db.query(func.count(Extension.extensionId)).filter(
            Extension.userId == current_user.userId,
            Extension.status == "pending"
        )
        extension_pending = extension_pending_query.scalar() or 0
        print(f"Extension pending query: {str(extension_pending_query)}")
        print(f"Extension pending count: {extension_pending}")
        
        authorship_pending_query = db.query(func.count(Authorship.authorId)).filter(
            Authorship.userId == current_user.userId,
            Authorship.status == "pending"
        )
        authorship_pending = authorship_pending_query.scalar() or 0
        print(f"Authorship pending query: {str(authorship_pending_query)}")
        print(f"Authorship pending count: {authorship_pending}")
        
        # Get total pending approvals for department heads and deans
        pending_approvals = 0
        if current_user.isDepartmentHead or current_user.isDean or current_user.role == "admin":
            print(f"User is {current_user.role} with isDepartmentHead={current_user.isDepartmentHead}, isDean={current_user.isDean}")
            
            # Department heads see pending items from their department
            if current_user.isDepartmentHead:
                department_filter = User.department == current_user.department
                print(f"Department head filter: User.department == '{current_user.department}'")
            # Deans see pending items from their college
            elif current_user.isDean:
                department_filter = User.college == current_user.college
                print(f"Dean filter: User.college == '{current_user.college}'")
            # Admins see all pending items
            else:
                department_filter = True
                print("Admin filter: All items")
                
            # Count pending publications
            pub_pending_query = db.query(func.count(ResearchActivities.raId)).join(
                User, ResearchActivities.userId == User.userId
            ).filter(
                ResearchActivities.status == "pending",
                department_filter
            )
            pub_pending_count = pub_pending_query.scalar() or 0
            pending_approvals += pub_pending_count
            print(f"Publications pending for approval query: {str(pub_pending_query)}")
            print(f"Publications pending for approval count: {pub_pending_count}")
            
            # Count pending teaching
            teach_pending_query = db.query(func.count(CourseAndSET.caSId)).join(
                User, CourseAndSET.userId == User.userId
            ).filter(
                CourseAndSET.status == "pending",
                department_filter
            )
            teach_pending_count = teach_pending_query.scalar() or 0
            pending_approvals += teach_pending_count
            print(f"Teaching pending for approval query: {str(teach_pending_query)}")
            print(f"Teaching pending for approval count: {teach_pending_count}")
            
            # Count pending extensions
            ext_pending_query = db.query(func.count(Extension.extensionId)).join(
                User, Extension.userId == User.userId
            ).filter(
                Extension.status == "pending",
                department_filter
            )
            ext_pending_count = ext_pending_query.scalar() or 0
            pending_approvals += ext_pending_count
            print(f"Extensions pending for approval query: {str(ext_pending_query)}")
            print(f"Extensions pending for approval count: {ext_pending_count}")
            
            # Count pending authorships
            auth_pending_query = db.query(func.count(Authorship.authorId)).join(
                User, Authorship.userId == User.userId
            ).filter(
                Authorship.status == "pending",
                department_filter
            )
            auth_pending_count = auth_pending_query.scalar() or 0
            pending_approvals += auth_pending_count
            print(f"Authorships pending for approval query: {str(auth_pending_query)}")
            print(f"Authorships pending for approval count: {auth_pending_count}")
            
            print(f"Total pending approvals: {pending_approvals}")
        
        # Prepare response data
        response_data = {
            "publications": {
                "count": publications_count,
                "pending": publications_pending
            },
            "teaching": {
                "count": teaching_count,
                "pending": teaching_pending
            },
            "extensions": {
                "count": extension_count,
                "pending": extension_pending
            },
            "authorships": {
                "count": authorship_count,
                "pending": authorship_pending
            },
            "pendingApprovals": pending_approvals
        }
        
        print(f"Returning response data: {response_data}")
        return response_data
    except Exception as e:
        print(f"Error getting record summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting record summary: {str(e)}"
        )
