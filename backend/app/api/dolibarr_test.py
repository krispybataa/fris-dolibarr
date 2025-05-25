from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from ..dependencies import get_db, get_current_user
from ..models import User
from ..services.dolibarr_client import dolibarr_client
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/ping", response_model=Dict[str, Any])
async def ping_dolibarr():
    """
    Simple test endpoint to verify Dolibarr API connection.
    """
    try:
        # Just try to list a single third party to verify connection
        result = await dolibarr_client.list_third_parties(limit=1)
        return {
            "status": "success",
            "message": "Successfully connected to Dolibarr API",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error connecting to Dolibarr API: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error connecting to Dolibarr API: {str(e)}")

@router.get("/third-party/{third_party_id}", response_model=Dict[str, Any])
async def get_third_party(
    third_party_id: int,
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific third party by ID.
    """
    try:
        result = await dolibarr_client.get_third_party(third_party_id)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error fetching third party {third_party_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching third party: {str(e)}")

@router.get("/third-parties", response_model=Dict[str, Any])
async def list_third_parties(
    limit: int = 10,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    """
    List third parties from Dolibarr.
    """
    try:
        result = await dolibarr_client.list_third_parties(limit=limit, offset=offset)
        return {
            "status": "success",
            "count": len(result),
            "data": result
        }
    except Exception as e:
        logger.error(f"Error listing third parties: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing third parties: {str(e)}")

@router.get("/search", response_model=Dict[str, Any])
async def search_third_party_by_email(
    email: str,
    current_user: User = Depends(get_current_user)
):
    """
    Search for a third party by email.
    """
    try:
        result = await dolibarr_client.get_third_party_by_email(email)
        return {
            "status": "success",
            "found": result is not None,
            "data": result
        }
    except Exception as e:
        logger.error(f"Error searching for third party by email {email}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching for third party: {str(e)}")
