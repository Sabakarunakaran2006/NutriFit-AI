from pydantic import BaseModel
from typing import Optional, List
from app.schemas.diet import FoodItemOut

class DetectedFoodPrediction(BaseModel):
    food_name: str
    confidence: float
    category: str
    estimated_calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    serving_size: float
    serving_unit: str
    matched_food_item: Optional[FoodItemOut] = None

class FoodScannerResponse(BaseModel):
    success: bool
    detected_food: str
    confidence_score: float
    confidence_percentage: str
    nutritional_estimate: DetectedFoodPrediction
    alternatives: List[DetectedFoodPrediction] = []
    estimation_disclaimer: str = (
        "Note: Nutritional values derived from image detection are approximations based on standard portion estimates. "
        "Actual nutrient density varies based on preparation, exact ingredients, and serving portion."
    )
