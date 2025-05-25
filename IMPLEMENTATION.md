# User Synchronization Implementation: Webapp to Dolibarr

This document outlines how user synchronization between the webapp database and Dolibarr database is implemented in the FRIS project.

## Overview

The system implements a one-way synchronization from the webapp to Dolibarr, where faculty profiles in the webapp are synced as "Third Parties" in Dolibarr. Each faculty profile in the webapp database maintains a reference to its corresponding entity in Dolibarr through a `dolibarr_id` field.

## Key Components

### 1. DolibarrClient Class

The `DolibarrClient` class (`backend/app/services/dolibarr_client.py`) handles all communication with the Dolibarr API:

- Uses `httpx` for asynchronous HTTP requests
- Requires Dolibarr API URL and API key from settings
- Provides methods for CRUD operations on Dolibarr entities (specifically "Third Parties")
- Maps faculty data to Dolibarr third party format

Key methods:
```python
async def create_third_party(self, data: Dict[str, Any]) -> Dict[str, Any]
async def update_third_party(self, third_party_id: int, data: Dict[str, Any]) -> Dict[str, Any]
async def get_third_party(self, third_party_id: int) -> Dict[str, Any]
async def delete_third_party(self, third_party_id: int) -> bool
def map_faculty_to_third_party(self, faculty_data: Dict[str, Any]) -> Dict[str, Any]
```

### 2. Faculty API Endpoints

The faculty API (`backend/app/api/faculty.py`) integrates with the DolibarrClient to sync faculty profiles:

- Faculty profiles are stored in the local database with a `dolibarr_id` field to track the mapping
- Syncing happens automatically during create/update/delete operations
- A dedicated endpoint for manual syncing is also provided

Key sync points:
- When creating a new faculty profile
- When updating a faculty profile (admin only)
- When deleting a faculty profile
- Through a dedicated manual sync endpoint (`POST /api/v1/faculty/{faculty_id}/sync`)

### 3. Data Model

The Faculty model includes a `dolibarr_id` field to store the ID of the corresponding entity in Dolibarr:

```python
dolibarr_id = Column(Integer, nullable=True)
```

### 4. Frontend Integration

The frontend (`frontend/src/pages/FacultyManagement.tsx`) provides a UI for managing faculty profiles and syncing with Dolibarr:

- Displays Dolibarr ID in the faculty list
- Provides a sync button for faculty profiles that aren't yet synced
- Makes API calls to the sync endpoint

## Implementation Details

### Automatic Syncing

1. **Create Operation**:
   ```python
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
   ```

2. **Update Operation**:
   ```python
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
   ```

3. **Delete Operation**:
   ```python
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
   ```

### Manual Syncing

The dedicated endpoint for manual syncing:

```python
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
```

### Data Mapping

The mapping function converts faculty data to Dolibarr third party format:

```python
def map_faculty_to_third_party(self, faculty_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Map faculty data to Dolibarr third party format.
    
    Args:
        faculty_data: Dictionary with faculty data
        
    Returns:
        Dictionary formatted for Dolibarr API
    """
    # Basic mapping of faculty fields to Dolibarr third party fields
    third_party_data = {
        "name": faculty_data.get("full_name", ""),
        "email": faculty_data.get("email", ""),
        "phone": faculty_data.get("phone", ""),
        "client": 0,  # Not a customer
        "fournisseur": 0,  # Not a supplier
        "status": 1,  # Active
    }
    
    # Add department as a custom field if available
    if "department" in faculty_data and faculty_data["department"]:
        third_party_data["array_options"] = {
            "options_department": faculty_data["department"]
        }
    
    return third_party_data
```

## Key Considerations

1. **Error Handling**: The implementation continues even if Dolibarr sync fails during automatic operations, which is a good approach for non-critical integrations.

2. **Permissions**: Only admins can trigger syncs to Dolibarr.

3. **Idempotency**: The sync endpoint handles both new entities (create) and existing ones (update).

4. **Configuration**: Dolibarr API URL and key are stored in settings.

## How to Implement in Another Project

1. **Create a Dolibarr Client**:
   - Copy or adapt the `DolibarrClient` class
   - Update the mapping function to match your data model
   - Ensure your settings include Dolibarr API URL and key

2. **Update Your Data Model**:
   - Add a `dolibarr_id` field to your user/faculty model
   - This field stores the ID of the corresponding entity in Dolibarr

3. **Implement Sync Points in Your API**:
   - Add sync logic to create/update/delete operations
   - Create a dedicated endpoint for manual syncing
   - Handle errors gracefully (continue even if Dolibarr sync fails)

4. **Add UI Elements**:
   - Display sync status in your UI
   - Add buttons for manual syncing
   - Show appropriate success/error messages
