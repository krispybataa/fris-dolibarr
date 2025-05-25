from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..dependencies import get_db, get_current_admin, get_current_user
from ..models import User
from ..schemas import UserCreate, UserUpdate, UserResponse
from ..services.dolibarr_client import dolibarr_client
from ..auth import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all users (admin only).
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Get a specific user by ID (admin only).
    """
    user = db.query(User).filter(User.userId == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Create a new user and sync with Dolibarr (admin only).
    """
    # Check if user already exists
    db_user = db.query(User).filter(User.userEmail == user_data.userEmail).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create user in database
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
    
    # Sync with Dolibarr
    try:
        # Map user data for Dolibarr
        user_data = {
            "userName": db_user.userName,
            "userEmail": db_user.userEmail,
            "department": db_user.department,
            "college": db_user.college,
            "rank": db_user.rank
        }
        
        # Try to find existing third party by email first
        existing_third_party = await dolibarr_client.get_third_party_by_email(db_user.userEmail)
        
        if existing_third_party and "id" in existing_third_party:
            # Update existing third party
            third_party = await dolibarr_client.update_third_party(
                existing_third_party["id"],
                user_data
            )
            db_user.dolibarr_third_party_id = existing_third_party["id"]
        else:
            # Create new third party
            third_party = await dolibarr_client.create_third_party(user_data)
            
            # Update user with Dolibarr third party ID
            if third_party and "id" in third_party:
                db_user.dolibarr_third_party_id = third_party["id"]
        
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        # Log error but don't fail the request
        print(f"Error syncing with Dolibarr: {str(e)}")
        import traceback
        traceback.print_exc()
    
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int, 
    user_data: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Update a user and sync with Dolibarr (admin only).
    """
    db_user = db.query(User).filter(User.userId == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields
    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    
    # Sync with Dolibarr if third party ID exists
    try:
        # Map user data for Dolibarr
        user_data = {
            "userName": db_user.userName,
            "userEmail": db_user.userEmail,
            "department": db_user.department,
            "college": db_user.college,
            "rank": db_user.rank
        }
        
        if db_user.dolibarr_third_party_id:
            # Update existing third party
            await dolibarr_client.update_third_party(
                db_user.dolibarr_third_party_id,
                user_data
            )
        else:
            # Try to find existing third party by email
            existing_third_party = await dolibarr_client.get_third_party_by_email(db_user.userEmail)
            
            if existing_third_party and "id" in existing_third_party:
                # Update existing third party
                third_party = await dolibarr_client.update_third_party(
                    existing_third_party["id"],
                    user_data
                )
                db_user.dolibarr_third_party_id = existing_third_party["id"]
            else:
                # Create new third party
                third_party = await dolibarr_client.create_third_party(user_data)
                
                # Update user with Dolibarr third party ID
                if third_party and "id" in third_party:
                    db_user.dolibarr_third_party_id = third_party["id"]
            
            db.commit()
            db.refresh(db_user)
    except Exception as e:
        # Log error but don't fail the request
        print(f"Error syncing with Dolibarr: {str(e)}")
        import traceback
        traceback.print_exc()
    
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """
    Delete a user (admin only).
    """
    db_user = db.query(User).filter(User.userId == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete from Dolibarr if third party ID exists
    if db_user.dolibarr_third_party_id:
        try:
            success = await dolibarr_client.delete_third_party(db_user.dolibarr_third_party_id)
            if success:
                print(f"Successfully deleted third party {db_user.dolibarr_third_party_id} from Dolibarr")
        except Exception as e:
            # Log error but don't fail the request
            print(f"Error deleting from Dolibarr: {str(e)}")
            import traceback
            traceback.print_exc()
    
    db.delete(db_user)
    db.commit()
    
    return None

@router.post("/{user_id}/sync", response_model=UserResponse)
async def sync_user_with_dolibarr(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually sync a user with Dolibarr (admin only).
    """
    db_user = db.query(User).filter(User.userId == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # If user already has dolibarr_third_party_id, update existing third party
        if db_user.dolibarr_third_party_id:
            await dolibarr_client.update_third_party(
                db_user.dolibarr_third_party_id,
                {
                    "userName": db_user.userName,
                    "userEmail": db_user.userEmail,
                    "department": db_user.department,
                    "college": db_user.college,
                    "rank": db_user.rank
                }
            )
        # Otherwise create new third party
        else:
            third_party = await dolibarr_client.create_third_party({
                "userName": db_user.userName,
                "userEmail": db_user.userEmail,
                "department": db_user.department,
                "college": db_user.college,
                "rank": db_user.rank
            })
            
            # Update user with Dolibarr third party ID
            if third_party and "id" in third_party:
                db_user.dolibarr_third_party_id = third_party["id"]
                db.commit()
                db.refresh(db_user)
    except Exception as e:
        # Log error and raise exception
        print(f"Error syncing with Dolibarr: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error syncing with Dolibarr: {str(e)}"
        )
    
    return db_user

@router.post("/sync-all", response_model=List[UserResponse])
async def sync_all_users_with_dolibarr(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually sync all users with Dolibarr (admin only).
    """
    users = db.query(User).all()
    synced_users = []
    errors = []
    
    # Process in smaller batches to avoid timeouts
    batch_size = 5
    total_users = len(users)
    
    print(f"Starting sync of {total_users} users with Dolibarr")
    
    # Process users in batches
    for i in range(0, total_users, batch_size):
        batch = users[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1} ({len(batch)} users)")
        
        # Process each user in the batch concurrently
        batch_tasks = []
        for user in batch:
            # Create task for each user
            if user.dolibarr_third_party_id:
                # Update existing third party
                task = dolibarr_client.update_third_party(
                    user.dolibarr_third_party_id,
                    {
                        "userName": user.userName,
                        "userEmail": user.userEmail,
                        "department": user.department,
                        "college": user.college,
                        "rank": user.rank
                    }
                )
            else:
                # Create new third party
                task = dolibarr_client.create_third_party({
                    "userName": user.userName,
                    "userEmail": user.userEmail,
                    "department": user.department,
                    "college": user.college,
                    "rank": user.rank
                })
            
            batch_tasks.append((user, task))
        
        # Execute all tasks for this batch
        for user, task in batch_tasks:
            try:
                result = await task
                
                # Update user with Dolibarr third party ID if it's a new record
                if not user.dolibarr_third_party_id and result and "id" in result:
                    user.dolibarr_third_party_id = result["id"]
                    db.commit()
                    db.refresh(user)
                    
                synced_users.append(user)
            except Exception as e:
                error_msg = f"Error syncing user {user.userName}: {str(e)}"
                print(error_msg)
                errors.append({"user": user.userName, "error": str(e)})
        
        # Wait a moment between batches to avoid overwhelming the API
        await asyncio.sleep(1)
    
    # If all users failed to sync, raise exception
    if len(errors) == len(users):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync any users with Dolibarr: {errors}"
        )
    
    # If some users failed to sync, commit successful ones
    if errors:
        db.commit()
        print(f"Some users failed to sync: {errors}")
    
    return synced_users
