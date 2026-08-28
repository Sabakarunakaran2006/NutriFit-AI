from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProfileBase(BaseModel):
    age: int = Field(..., ge=12, le=100)
    gender: str = Field(..., pattern="^(male|female|other)$")
    height_cm: float = Field(..., ge=100.0, le=250.0)
    weight_kg: float = Field(..., ge=30.0, le=300.0)
    target_weight_kg: float = Field(..., ge=30.0, le=300.0)
    goal: str = Field(..., pattern="^(weight_loss|muscle_gain|maintenance|endurance)$")
    activity_level: str = Field(..., pattern="^(sedentary|light|moderate|active|very_active)$")
    dietary_preference: str = Field(..., pattern="^(vegetarian|non_vegetarian|vegan|keto|other)$")
    allergies: List[str] = []
    health_conditions: List[str] = []
    sleep_hours: float = Field(default=7.5, ge=3.0, le=14.0)
    stress_level: str = Field(default="moderate", pattern="^(low|moderate|high)$")
    meal_frequency: int = Field(default=4, ge=2, le=6)

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=12, le=100)
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    target_weight_kg: Optional[float] = None
    goal: Optional[str] = None
    activity_level: Optional[str] = None
    dietary_preference: Optional[str] = None
    allergies: Optional[List[str]] = None
    health_conditions: Optional[List[str]] = None
    sleep_hours: Optional[float] = None
    stress_level: Optional[str] = None
    meal_frequency: Optional[int] = None

class ProfileOut(ProfileBase):
    id: int
    user_id: int
    bmr: float
    tdee: float
    target_calories: float
    target_protein: float
    target_carbs: float
    target_fat: float
    water_goal_liters: float
    fitness_archetype: str
    ml_caloric_adjustment: float
    updated_at: datetime

    class Config:
        from_attributes = True

class NutritionTargets(BaseModel):
    bmr: float
    tdee: float
    target_calories: float
    target_protein: float
    target_carbs: float
    target_fat: float
    water_goal_liters: float
    fitness_archetype: str
    explanation: str
