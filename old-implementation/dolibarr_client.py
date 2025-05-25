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
        
        Args:
            data: Dictionary with third party data
            
        Returns:
            Dictionary with created third party data including ID
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
        
        Args:
            third_party_id: ID of the third party to update
            data: Dictionary with updated third party data
            
        Returns:
            Dictionary with updated third party data
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
        
        Args:
            third_party_id: ID of the third party to retrieve
            
        Returns:
            Dictionary with third party data
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
        
        Args:
            third_party_id: ID of the third party to delete
            
        Returns:
            True if successful
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
    
    async def search_third_parties(self, search_term: str) -> List[Dict[str, Any]]:
        """
        Search for Third Parties in Dolibarr.
        
        Args:
            search_term: Term to search for
            
        Returns:
            List of matching third parties
        """
        url = f"{self.base_url}/thirdparties"
        params = {"sortfield": "t.rowid", "sortorder": "ASC", "limit": 100}
        
        if search_term:
            params["sqlfilters"] = f"(t.nom:like:'{search_term}%' or t.email:like:'{search_term}%')"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url, 
                    params=params,
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while searching third parties: {e}")
            logger.error(f"Response content: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error searching third parties in Dolibarr: {str(e)}")
            raise
    
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
