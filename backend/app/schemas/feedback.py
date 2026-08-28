from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FeedbackCreate(BaseModel):
    logged_date: str  # YYYY-MM-DD
    diet_rating: int = Field(..., ge=1, le=5)
    workout_rating: int = Field(..., ge=1, le=5)
    workout_difficulty: str = Field(..., pattern="^(too_easy|appropriate|too_difficult)$")
    followed_diet: bool = True
    energy_level: int = Field(..., ge=1, le=10)
    hunger_level: int = Field(..., ge=1, le=10)
    comments: Optional[str] = ""

class FeedbackOut(FeedbackCreate):
    id: int
    user_id: int
    processed: bool
    ai_response: str
    created_at: datetime

    class Config:
        from_attributes = True

class RecommendationOut(BaseModel):
    id: int
    user_id: int
    rec_type: str
    title: str
    message: str
    reason: str
    impact_calories: float
    impact_protein: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AdaptiveAdjustmentSummary(BaseModel):
    feedback_id: int
    old_target_calories: float
    new_target_calories: float
    old_target_protein: float
    new_target_protein: float
    adjustment_reason: str
    workout_adjustment: Optional[str] = None
    ai_explanation: str
    applied_recommendation: RecommendationOut
