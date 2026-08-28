import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Profile, FoodItem, MealPlan, MealPlanItem
from app.schemas.diet import MealPlanOut, FoodItemOut, MealReplaceRequest, MealReplaceAlternative
from app.core.dependencies import get_current_user
from app.ml.diet_engine import generate_diet_plan, get_meal_replacement_alternatives

router = APIRouter(prefix="/diet", tags=["Diet & Meal Plans"])

@router.get("/foods", response_model=List[FoodItemOut])
def get_food_items(
    category: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(FoodItem)
    if category:
        q = q.filter(FoodItem.category == category)
    if query:
        q = q.filter(FoodItem.name.ilike(f"%{query}%"))
    return q.limit(100).all()

@router.get("/plan", response_model=MealPlanOut)
def get_current_diet_plan(
    date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = date or datetime.date.today().isoformat()
    plan = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.plan_date == target_date
    ).first()
    
    if not plan:
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if not profile:
            raise HTTPException(status_code=400, detail="Profile required to generate diet plan")
        allergies = json.loads(profile.allergies) if profile.allergies else []
        plan = generate_diet_plan(
            db=db,
            user_id=current_user.id,
            plan_date=target_date,
            target_calories=profile.target_calories,
            target_protein=profile.target_protein,
            target_carbs=profile.target_carbs,
            target_fat=profile.target_fat,
            goal=profile.goal,
            dietary_pref=profile.dietary_preference,
            allergies=allergies
        )
    return plan

@router.post("/generate", response_model=MealPlanOut)
def regenerate_diet_plan(
    date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = date or datetime.date.today().isoformat()
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile required to generate diet plan")
        
    # Delete existing if any for this date
    existing = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.plan_date == target_date
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        
    allergies = json.loads(profile.allergies) if profile.allergies else []
    new_plan = generate_diet_plan(
        db=db,
        user_id=current_user.id,
        plan_date=target_date,
        target_calories=profile.target_calories,
        target_protein=profile.target_protein,
        target_carbs=profile.target_carbs,
        target_fat=profile.target_fat,
        goal=profile.goal,
        dietary_pref=profile.dietary_preference,
        allergies=allergies
    )
    return new_plan

@router.get("/replace/alternatives/{item_id}", response_model=List[MealReplaceAlternative])
def get_alternatives(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(MealPlanItem).filter(MealPlanItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Meal item not found")
        
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    allergies = json.loads(profile.allergies) if profile and profile.allergies else []
    pref = profile.dietary_preference if profile else "non_vegetarian"
    goal = profile.goal if profile else "muscle_gain"
    
    alternatives = get_meal_replacement_alternatives(
        db=db,
        meal_item=item,
        dietary_pref=pref,
        allergies=allergies,
        goal=goal
    )
    return alternatives

@router.post("/replace/apply/{item_id}/{food_id}")
def apply_meal_replacement(
    item_id: int,
    food_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(MealPlanItem).filter(MealPlanItem.id == item_id).first()
    food = db.query(FoodItem).filter(FoodItem.id == food_id).first()
    if not item or not food:
        raise HTTPException(status_code=404, detail="Meal item or replacement food not found")
        
    # Scale replacement food to match original calorie budget
    target_cals = item.calories
    mult = round(max(0.5, min(2.5, target_cals / max(50.0, food.calories))), 2)
    
    item.food_item_id = food.id
    item.custom_name = food.name
    item.calories = round(food.calories * mult, 1)
    item.protein_g = round(food.protein_g * mult, 1)
    item.carbs_g = round(food.carbs_g * mult, 1)
    item.fat_g = round(food.fat_g * mult, 1)
    item.serving_amount = round(food.serving_size * mult, 1)
    item.serving_unit = food.serving_unit
    item.reason = f"User-selected replacement: {food.name} calibrated to {item.calories} kcal ({item.protein_g}g Protein)."
    
    # Recalculate plan totals
    meal_plan = item.meal_plan
    meal_plan.total_calories = round(sum(i.calories for i in meal_plan.items), 1)
    meal_plan.total_protein = round(sum(i.protein_g for i in meal_plan.items), 1)
    meal_plan.total_carbs = round(sum(i.carbs_g for i in meal_plan.items), 1)
    meal_plan.total_fat = round(sum(i.fat_g for i in meal_plan.items), 1)
    
    db.commit()
    db.refresh(meal_plan)
    return {"message": "Meal replaced successfully", "updated_meal_plan": meal_plan}
