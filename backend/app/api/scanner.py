from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.scanner import FoodScannerResponse
from app.core.dependencies import get_current_user
from app.database.models import User
from app.ml.food_scanner_engine import analyze_food_image

router = APIRouter(prefix="/food-scanner", tags=["AI Food Scanner"])

@router.post("/predict", response_model=FoodScannerResponse)
async def predict_food_from_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accepts food image upload, performs image analysis to recognize food item,
    and returns calorie/macronutrient breakdown with portion estimation disclaimer.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (JPEG/PNG/WEBP)")
        
    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image size exceeds 10MB limit")
        
    result = analyze_food_image(
        image_bytes=image_bytes,
        filename=file.filename or "",
        db=db
    )
    return result
