from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, User
from auth import get_current_user
from analytics_engine import DeveloperGrowthEngine

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/growth")
def get_growth_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analytics = DeveloperGrowthEngine.get_user_analytics(current_user.id, db)
    return {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name
        },
        "analytics": analytics
    }
