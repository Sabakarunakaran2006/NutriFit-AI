from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Feedback, Recommendation
from app.schemas.feedback import FeedbackCreate, FeedbackOut, RecommendationOut, AdaptiveAdjustmentSummary
from app.core.dependencies import get_current_user
from app.ml.adaptive_engine import process_adaptive_feedback

router = APIRouter(prefix="/feedback", tags=["Feedback & Adaptive Recalibration"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_daily_feedback(
    feedback_in: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    feedback = Feedback(
        user_id=current_user.id,
        logged_date=feedback_in.logged_date,
        diet_rating=feedback_in.diet_rating,
        workout_rating=feedback_in.workout_rating,
        workout_difficulty=feedback_in.workout_difficulty,
        followed_diet=feedback_in.followed_diet,
        energy_level=feedback_in.energy_level,
        hunger_level=feedback_in.hunger_level,
        comments=feedback_in.comments,
        processed=False
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    
    # Trigger Adaptive Feedback Engine
    adaptive_result = process_adaptive_feedback(db=db, user_id=current_user.id, feedback_id=feedback.id)
    return {
        "message": "Feedback recorded and analyzed by Adaptive AI",
        "feedback": feedback,
        "adaptive_adjustment": adaptive_result
    }

@router.get("/history", response_model=List[FeedbackOut])
def get_feedback_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    feedbacks = db.query(Feedback).filter(
        Feedback.user_id == current_user.id
    ).order_by(Feedback.logged_date.desc()).limit(30).all()
    return feedbacks

@router.get("/recommendations", response_model=List[RecommendationOut])
def get_user_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recs = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(Recommendation.created_at.desc()).limit(20).all()
    return recs
