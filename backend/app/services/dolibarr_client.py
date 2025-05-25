import httpx
import json
import logging
import asyncio
from typing import Dict, Any, Optional, List
from ..config import settings

logger = logging.getLogger(__name__)

class DolibarrClient:
    """
    Client for interacting with Dolibarr API, specifically for Third Party management.
    """
    
    def __init__(self):
        self.base_url = settings.DOLIBARR_API_URL
        self.headers = {
            "DOLAPIKEY": settings.DOLIBARR_API_KEY,
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        logger.info(f"Initialized Dolibarr client with API URL: {self.base_url}")
        logger.info(f"Using API key: {settings.DOLIBARR_API_KEY[:5]}...")

    
    async def create_third_party(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new third party in Dolibarr based on user data.
        
        Args:
            user_data: User data including name, email, etc.
            
        Returns:
            Created third party data including ID
        """
        # Map user data to Dolibarr third party fields
        third_party_data = {
            "name": user_data.get("userName") or user_data.get("full_name", ""),
            "name_alias": f"Faculty - {user_data.get('department')}",
            "address": "",
            "zip": "",
            "town": "",
            "email": user_data.get("userEmail") or user_data.get("email", ""),
            "phone": user_data.get("phone", ""),
            "client": 0,  # Not a client
            "fournisseur": 0,  # Not a supplier
            "status": 1,  # Active
        }
        
        # Add department and college as a note
        if user_data.get('department') or user_data.get('college') or user_data.get('rank'):
            third_party_data["note_private"] = f"Department: {user_data.get('department', '')}\nCollege: {user_data.get('college', '')}\nRank: {user_data.get('rank', '')}"
        
        # Add department as a custom field if available
        if user_data.get('department'):
            third_party_data["array_options"] = {
                "options_department": user_data.get('department')
            }
        
        url = f"{self.base_url}/thirdparties"
        logger.info(f"Creating third party with data: {third_party_data}")
        logger.info(f"POST request to: {url}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url, 
                    json=third_party_data, 
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                
                # Dolibarr returns the ID as a string/number
                dolibarr_id = response.text
                logger.info(f"Successfully created third party with ID: {dolibarr_id}")
                
                # Fetch the created third party to return complete data
                return await self.get_third_party(int(dolibarr_id))
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while creating third party: {e}")
            logger.error(f"Response content: {e.response.text}")
            logger.error(f"Request data: {third_party_data}")
            raise
        except Exception as e:
            logger.error(f"Error creating third party in Dolibarr: {str(e)}")
            raise
    
    async def update_third_party(self, third_party_id: int, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing third party in Dolibarr.
        
        Args:
            third_party_id: Dolibarr third party ID
            user_data: Updated user data
            
        Returns:
            Updated third party data
        """
        # Map user data to Dolibarr third party fields
        third_party_data = {
            "name": user_data.get("userName") or user_data.get("full_name", ""),
            "name_alias": f"Faculty - {user_data.get('department')}",
            "email": user_data.get("userEmail") or user_data.get("email", ""),
        }
        
        # Add department and college as a note
        if user_data.get('department') or user_data.get('college') or user_data.get('rank'):
            third_party_data["note_private"] = f"Department: {user_data.get('department', '')}\nCollege: {user_data.get('college', '')}\nRank: {user_data.get('rank', '')}"
        
        # Add department as a custom field if available
        if user_data.get('department'):
            third_party_data["array_options"] = {
                "options_department": user_data.get('department')
            }
        
        url = f"{self.base_url}/thirdparties/{third_party_id}"
        logger.info(f"Updating third party {third_party_id} with data: {third_party_data}")
        logger.info(f"PUT request to: {url}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.put(
                    url, 
                    json=third_party_data, 
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                logger.info(f"Successfully updated third party with ID: {third_party_id}")
                
                # Return the updated third party
                return await self.get_third_party(third_party_id)
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while updating third party: {e}")
            logger.error(f"Response content: {e.response.text}")
            logger.error(f"Request data: {third_party_data}")
            raise
        except Exception as e:
            logger.error(f"Error updating third party in Dolibarr: {str(e)}")
            raise
    
    async def get_third_party(self, third_party_id: int) -> Dict[str, Any]:
        """
        Get third party details by ID.
        
        Args:
            third_party_id: Dolibarr third party ID
            
        Returns:
            Third party data
        """
        url = f"{self.base_url}/thirdparties/{third_party_id}"
        logger.info(f"Fetching third party with ID: {third_party_id}")
        logger.info(f"GET request to: {url}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url, 
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Successfully retrieved third party with ID: {third_party_id}")
                return data
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while getting third party: {e}")
            logger.error(f"Response content: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error getting third party from Dolibarr: {str(e)}")
            raise
    
    async def get_third_party_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Find a third party by email address.
        
        Args:
            email: Email address to search for
            
        Returns:
            Third party data if found, None otherwise
        """
        # URL encode the email for safety
        encoded_email = email.replace('@', '%40')
        url = f"{self.base_url}/thirdparties?sqlfilters=(t.email:=:'{encoded_email}')"
        
        logger.info(f"Searching for third party with email: {email}")
        logger.info(f"GET request to: {url}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url, 
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    logger.info(f"Found third party with email {email}: ID={data[0].get('id')}")
                    return data[0]
                    
                logger.info(f"No third party found with email: {email}")
                return None
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while searching for third party by email: {e}")
            logger.error(f"Response content: {e.response.text}")
            return None
        except Exception as e:
            logger.error(f"Error searching for third party by email: {str(e)}")
            return None
    
    async def delete_third_party(self, third_party_id: int) -> bool:
        """
        Delete a third party from Dolibarr.
        
        Args:
            third_party_id: Dolibarr third party ID
            
        Returns:
            True if deletion was successful
        """
        url = f"{self.base_url}/thirdparties/{third_party_id}"
        logger.info(f"Deleting third party with ID: {third_party_id}")
        logger.info(f"DELETE request to: {url}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    url, 
                    headers=self.headers,
                    timeout=30.0
                )
                response.raise_for_status()
                logger.info(f"Successfully deleted third party with ID: {third_party_id}")
                return True
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred while deleting third party: {e}")
            logger.error(f"Response content: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error deleting third party from Dolibarr: {str(e)}")
            raise
    
    async def list_third_parties(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        logger.info(f"Listing third parties with limit={limit}, offset={offset}")
        
        response = await self._make_request("GET", f"thirdparties?limit={limit}&page={offset//limit}")
        
        if "error" in response:
            logger.error(f"Error listing third parties: {response['error']}")
            return []
        
        if isinstance(response, list):
            logger.info(f"Successfully retrieved {len(response)} third parties")
            return response
            
        logger.warning(f"Unexpected response format from Dolibarr API: {type(response)}")
        return []

# Create a singleton instance
dolibarr_client = DolibarrClient()
