from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FoodItemBase(BaseModel):
    name: str
    category: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float = 0.0
    serving_size: float = 100.0
    serving_unit: str = "g"
    dietary_tags: str = "non_vegetarian"
    allergen_tags: str = ""
    image_url: Optional[str] = None

class FoodItemOut(FoodItemBase):
    id: int

    class Config:
        from_attributes = True

class MealPlanItemOut(BaseModel):
    id: int
    meal_type: str  # breakfast, lunch, snack, dinner
    food_item_id: Optional[int] = None
    custom_name: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    serving_amount: float
    serving_unit: str
    meal_time: str
    reason: str
    food_item: Optional[FoodItemOut] = None

    class Config:
        from_attributes = True

class MealPlanOut(BaseModel):
    id: int
    user_id: int
    plan_date: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    status: str
    explanation: str
    created_at: datetime
    items: List[MealPlanItemOut] = []

    class Config:
        from_attributes = True

class MealReplaceRequest(BaseModel):
    meal_plan_item_id: int
    preferred_category: Optional[str] = None

class MealReplaceAlternative(BaseModel):
    food_item: FoodItemOut
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    serving_amount: float
    serving_unit: str
    reason: str

class MealLogCreate(BaseModel):
    logged_date: str
    meal_type: str
    food_item_id: Optional[int] = None
    food_name: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    serving_size: float = 1.0
    serving_unit: str = "serving"

class MealLogOut(MealLogCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
