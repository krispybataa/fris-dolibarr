# Dolibarr Integration: Complete Implementation Guide

This document provides a comprehensive overview of how the FRIS webapp integrates with Dolibarr, including all relevant files, their interactions, and the complete flow from frontend to backend to Dolibarr.

## System Architecture

The integration follows this general flow:

1. Frontend UI components allow users to view Dolibarr IDs and trigger sync operations
2. Frontend API services make calls to backend endpoints
3. Backend API endpoints handle requests and use the DolibarrClient service
4. DolibarrClient communicates with Dolibarr API using configured credentials
5. Database stores Dolibarr IDs to maintain the relationship

## 1. Configuration

### `backend/app/config.py`

This file contains the Dolibarr API configuration settings:

```python
# Dolibarr API settings
DOLIBARR_API_URL: str = os.getenv("DOLIBARR_API_URL", "https://wantwofrisky.with5.dolicloud.com/api/index.php")
DOLIBARR_API_KEY: str = os.getenv("DOLIBARR_API_KEY", "CZefWiUPr47K38s0cw6BD0L0xwqrJG19")
```

These settings can be overridden by environment variables. The default values are provided as fallbacks.

## 2. Backend Implementation

### `backend/app/services/dolibarr_client.py`

This is the core service that handles all communication with the Dolibarr API:

```python
import httpx
from typing import Dict, Any, Optional, List
import json
import logging
from ..config import settings

logger = logging.getLogger(__name__)

class DolibarrClient:
    """
    Client for interacting with Dolibarr API.
    Handles minimal integration with Dolibarr for faculty profiles as Third Parties.
    """
    
    def __init__(self):
        self.base_url = settings.DOLIBARR_API_URL
        self.headers = {
            "DOLAPIKEY": settings.DOLIBARR_API_KEY,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    async def create_third_party(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new Third Party in Dolibarr.
        """
        url = f"{self.base_url}/thirdparties"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url, 
                    json=data, 
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                
                # Dolibarr returns the ID as a string/number
                dolibarr_id = response.text
                
                # Fetch the created third party to return complete data
                return await self.get_third_party(int(dolibarr_id))
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while creating third party: {e}")
            logger.error(f"Response content: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error creating third party in Dolibarr: {str(e)}")
            raise
    
    async def update_third_party(self, third_party_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing Third Party in Dolibarr.
        """
        url = f"{self.base_url}/thirdparties/{third_party_id}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    url, 
                    json=data, 
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                
                # Return the updated third party
                return await self.get_third_party(third_party_id)
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while updating third party: {e}")
            logger.error(f"Response content: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error updating third party in Dolibarr: {str(e)}")
            raise
    
    async def get_third_party(self, third_party_id: int) -> Dict[str, Any]:
        """
        Get a Third Party from Dolibarr by ID.
        """
        url = f"{self.base_url}/thirdparties/{third_party_id}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url, 
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while getting third party: {e}")
            logger.error(f"Response content: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error getting third party from Dolibarr: {str(e)}")
            raise
    
    async def delete_third_party(self, third_party_id: int) -> bool:
        """
        Delete a Third Party from Dolibarr.
        """
        url = f"{self.base_url}/thirdparties/{third_party_id}"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    url, 
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return True
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while deleting third party: {e}")
            logger.error(f"Response content: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error deleting third party from Dolibarr: {str(e)}")
            raise
    
    def map_faculty_to_third_party(self, faculty_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Map faculty data to Dolibarr third party format.
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

### `backend/app/api/faculty.py`

This file contains the API endpoints that interact with Dolibarr:

```python
# Sync endpoint
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

The faculty API also handles automatic syncing during create, update, and delete operations:

#### Create Operation

```python
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
```

#### Update Operation

```python
@router.put("/{faculty_id}", response_model=FacultyResponse)
async def update_faculty(
    faculty_id: int,
    faculty_in: FacultyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a faculty profile.
    Admin updates sync with Dolibarr.
    """
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
```

#### Delete Operation

```python
@router.delete("/{faculty_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin_role)
) -> None:
    """
    Delete a faculty profile (admin only).
    """
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

## 3. Frontend Implementation

### `frontend/src/services/api.ts`

This file contains the API service for faculty operations, including syncing with Dolibarr:

```typescript
// Faculty API
export const facultyApi = {
  getAll: async () => {
    const response = await api.get('/faculty');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/faculty/${id}`);
    return response.data;
  },
  
  create: async (faculty: FacultyCreate) => {
    const response = await api.post('/faculty', faculty);
    return response.data;
  },
  
  update: async (id: number, faculty: FacultyUpdate) => {
    const response = await api.put(`/faculty/${id}`, faculty);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/faculty/${id}`);
  },
  
  syncWithDolibarr: async (id: number) => {
    const response = await api.post(`/faculty/${id}/sync`);
    return response.data;
  },
};
```

### `frontend/src/pages/FacultyManagement.tsx`

This file contains the UI components for managing faculty and syncing with Dolibarr:

```typescript
// Function to handle syncing with Dolibarr
const handleSyncWithDolibarr = async (id: number) => {
  try {
    await facultyApi.syncWithDolibarr(id);
    // Refresh faculty list to get updated dolibarr_id
    const data = await facultyApi.getAll();
    setFaculties(data);
    setSuccess('Faculty synced with Dolibarr successfully.');
  } catch (err: any) {
    console.error('Error syncing with Dolibarr:', err);
    setError(err.response?.data?.detail || 'An error occurred while syncing with Dolibarr.');
  }
};

// UI component showing Dolibarr ID and sync button
<TableCell>
  {faculty.dolibarr_id || '-'}
  {!faculty.dolibarr_id && (
    <Button 
      size="small" 
      onClick={() => handleSyncWithDolibarr(faculty.id)}
      sx={{ ml: 1 }}
    >
      Sync
    </Button>
  )}
</TableCell>
```

## 4. Database Schema

The Faculty model includes a `dolibarr_id` field to store the reference to the Dolibarr entity:

```python
class Faculty(Base):
    __tablename__ = "faculty"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    department = Column(String, nullable=True)
    position = Column(String, nullable=True)
    dolibarr_id = Column(Integer, nullable=True)
    # other fields...
```

## 5. Complete Flow

Here's the complete flow of how the system interfaces with Dolibarr:

1. **Configuration Setup**:
   - Dolibarr API URL and key are configured in `config.py`
   - These can be overridden by environment variables

2. **User Creation**:
   - When an admin creates a faculty user, the system:
     1. Creates the faculty record in the local database
     2. Maps the faculty data to Dolibarr format
     3. Creates a Third Party in Dolibarr
     4. Stores the Dolibarr ID in the faculty record

3. **User Update**:
   - When an admin updates a faculty user, the system:
     1. Updates the faculty record in the local database
     2. If the faculty has a Dolibarr ID, maps the updated data
     3. Updates the Third Party in Dolibarr

4. **User Deletion**:
   - When an admin deletes a faculty user, the system:
     1. If the faculty has a Dolibarr ID, deletes the Third Party in Dolibarr
     2. Deletes the faculty record from the local database

5. **Manual Sync**:
   - The UI provides a "Sync" button for faculty records without a Dolibarr ID
   - When clicked, it:
     1. Calls the sync endpoint
     2. The endpoint creates or updates the Third Party in Dolibarr
     3. Updates the faculty record with the Dolibarr ID
     4. Refreshes the UI to show the updated Dolibarr ID

## 6. Error Handling

The system implements robust error handling:

1. **Graceful Degradation**:
   - Automatic sync operations continue even if Dolibarr sync fails
   - This ensures the local system remains functional even if Dolibarr is unavailable

2. **Detailed Logging**:
   - All Dolibarr API errors are logged with detailed information
   - This helps with debugging and troubleshooting

3. **User Feedback**:
   - For manual sync operations, errors are displayed to the user
   - This provides immediate feedback on sync issues

## 7. Implementation in Another Project

To implement this in another project, follow these steps:

1. **Copy the DolibarrClient Class**:
   - Copy `dolibarr_client.py` to your project
   - Update imports and dependencies as needed

2. **Configure Dolibarr Settings**:
   - Add Dolibarr API URL and key to your configuration

3. **Update Your Data Model**:
   - Add a `dolibarr_id` field to your user/faculty model

4. **Implement API Endpoints**:
   - Add sync functionality to your API endpoints
   - Include automatic syncing in create/update/delete operations
   - Add a dedicated sync endpoint

5. **Add Frontend Components**:
   - Implement UI components to display Dolibarr IDs
   - Add sync buttons and functionality
   - Implement error handling and user feedback

6. **Test the Integration**:
   - Test with valid Dolibarr credentials
   - Verify that data is correctly mapped and synced
   - Test error handling and recovery

## 8. Common Issues and Solutions

1. **Authentication Errors (401)**:
   - Verify that the API key is correct
   - Check that the API key has the necessary permissions in Dolibarr
   - Ensure the API key is included in the `DOLAPIKEY` header

2. **Mapping Issues**:
   - Ensure that the mapping function correctly translates your data to Dolibarr format
   - Check for required fields in Dolibarr that might be missing in your data

3. **CORS Issues**:
   - If accessing Dolibarr directly from the frontend, ensure CORS is configured
   - Consider using a backend proxy if CORS issues persist

4. **API Version Differences**:
   - Dolibarr API may change between versions
   - Check the Dolibarr API documentation for your specific version

5. **Error Handling**:
   - Implement comprehensive error handling for all API calls
   - Log detailed error information for debugging
