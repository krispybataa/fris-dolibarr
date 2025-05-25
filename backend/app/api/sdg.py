from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..dependencies import get_db, get_current_user
from ..models import User, SDG, SDGSubset
from ..schemas import SDGCreate, SDGInDB, SDGSubsetCreate, SDGSubsetInDB

router = APIRouter()

# Predefined SDGs for reference
SDG_REFERENCE = [
    {"sdgNum": 1, "sdgDesc": "No Poverty"},
    {"sdgNum": 2, "sdgDesc": "Zero Hunger"},
    {"sdgNum": 3, "sdgDesc": "Good Health and Well-being"},
    {"sdgNum": 4, "sdgDesc": "Quality Education"},
    {"sdgNum": 5, "sdgDesc": "Gender Equality"},
    {"sdgNum": 6, "sdgDesc": "Clean Water and Sanitation"},
    {"sdgNum": 7, "sdgDesc": "Affordable and Clean Energy"},
    {"sdgNum": 8, "sdgDesc": "Decent Work and Economic Growth"},
    {"sdgNum": 9, "sdgDesc": "Industry, Innovation and Infrastructure"},
    {"sdgNum": 10, "sdgDesc": "Reduced Inequality"},
    {"sdgNum": 11, "sdgDesc": "Sustainable Cities and Communities"},
    {"sdgNum": 12, "sdgDesc": "Responsible Consumption and Production"},
    {"sdgNum": 13, "sdgDesc": "Climate Action"},
    {"sdgNum": 14, "sdgDesc": "Life Below Water"},
    {"sdgNum": 15, "sdgDesc": "Life on Land"},
    {"sdgNum": 16, "sdgDesc": "Peace, Justice and Strong Institutions"},
    {"sdgNum": 17, "sdgDesc": "Partnerships for the Goals"}
]

@router.get("/reference", response_model=List[Dict[str, Any]])
async def get_sdg_reference():
    """
    Get the reference list of all SDGs.
    """
    return SDG_REFERENCE

@router.get("/research/{research_id}", response_model=List[SDGInDB])
async def get_sdgs_for_research(
    research_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all SDGs for a specific research activity.
    """
    sdgs = db.query(SDG).filter(SDG.raId == research_id).all()
    return sdgs

@router.post("/research/{research_id}", response_model=SDGInDB)
async def add_sdg_to_research(
    research_id: int,
    sdg_data: SDGCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add an SDG to a research activity.
    """
    # Check if research activity exists and belongs to user
    from ..models import ResearchActivities
    research = db.query(ResearchActivities).filter(
        ResearchActivities.raId == research_id,
        ResearchActivities.userId == current_user.userId
    ).first()
    
    if research is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research activity not found or you don't have permission"
        )
    
    # Create SDG
    db_sdg = SDG(
        raId=research_id,
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
            db.refresh(db_subset)
    
    return db_sdg

@router.delete("/research/{research_id}/sdg/{sdg_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sdg_from_research(
    research_id: int,
    sdg_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an SDG from a research activity.
    """
    # Check if research activity exists and belongs to user
    from ..models import ResearchActivities
    research = db.query(ResearchActivities).filter(
        ResearchActivities.raId == research_id,
        ResearchActivities.userId == current_user.userId
    ).first()
    
    if research is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research activity not found or you don't have permission"
        )
    
    # Check if SDG exists and belongs to the research activity
    sdg = db.query(SDG).filter(
        SDG.sdgId == sdg_id,
        SDG.raId == research_id
    ).first()
    
    if sdg is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SDG not found for this research activity"
        )
    
    # Delete SDG subsets
    db.query(SDGSubset).filter(SDGSubset.sdgId == sdg_id).delete()
    
    # Delete SDG
    db.delete(sdg)
    db.commit()
    
    return None

@router.get("/sdg/{sdg_id}/subsets", response_model=List[SDGSubsetInDB])
async def get_sdg_subsets(
    sdg_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all subsets for a specific SDG.
    """
    subsets = db.query(SDGSubset).filter(SDGSubset.sdgId == sdg_id).all()
    return subsets

@router.post("/sdg/{sdg_id}/subsets", response_model=SDGSubsetInDB)
async def add_subset_to_sdg(
    sdg_id: int,
    subset_data: SDGSubsetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a subset to an SDG.
    """
    # Check if SDG exists
    sdg = db.query(SDG).filter(SDG.sdgId == sdg_id).first()
    
    if sdg is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SDG not found"
        )
    
    # Check if research activity belongs to user
    from ..models import ResearchActivities
    research = db.query(ResearchActivities).filter(
        ResearchActivities.raId == sdg.raId,
        ResearchActivities.userId == current_user.userId
    ).first()
    
    if research is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this SDG"
        )
    
    # Create SDG subset
    db_subset = SDGSubset(
        sdgId=sdg_id,
        sdgSNum=subset_data.sdgSNum,
        sdgSDesc=subset_data.sdgSDesc
    )
    
    db.add(db_subset)
    db.commit()
    db.refresh(db_subset)
    
    return db_subset

@router.delete("/subset/{subset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sdg_subset(
    subset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an SDG subset.
    """
    # Check if subset exists
    subset = db.query(SDGSubset).filter(SDGSubset.sdgSId == subset_id).first()
    
    if subset is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SDG subset not found"
        )
    
    # Check if user has permission (via research activity)
    sdg = db.query(SDG).filter(SDG.sdgId == subset.sdgId).first()
    
    if sdg:
        from ..models import ResearchActivities
        research = db.query(ResearchActivities).filter(
            ResearchActivities.raId == sdg.raId,
            ResearchActivities.userId == current_user.userId
        ).first()
        
        if research is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this SDG subset"
            )
    
    # Delete subset
    db.delete(subset)
    db.commit()
    
    return None
