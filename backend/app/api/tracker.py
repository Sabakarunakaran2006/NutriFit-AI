import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Profile, MealLog, WorkoutLog, FoodItem
from app.schemas.diet import MealLogCreate, MealLogOut
from app.schemas.workout import WorkoutLogCreate, WorkoutLogOut
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/tracker", tags=["Daily Logging & Tracking"])

@router.get("/daily-summary")
def get_daily_tracker_summary(
    date: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = date or datetime.date.today().isoformat()
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    target_cals = profile.target_calories if profile else 2000.0
    target_prot = profile.target_protein if profile else 120.0
    target_carbs = profile.target_carbs if profile else 220.0
    target_fat = profile.target_fat if profile else 65.0
    water_goal = profile.water_goal_liters if profile else 3.0
    
    meal_logs = db.query(MealLog).filter(
        MealLog.user_id == current_user.id,
        MealLog.logged_date == target_date
    ).all()
    
    workout_logs = db.query(WorkoutLog).filter(
        WorkoutLog.user_id == current_user.id,
        WorkoutLog.logged_date == target_date
    ).all()
    
    consumed_cals = sum(m.calories for m in meal_logs)
    consumed_prot = sum(m.protein_g for m in meal_logs)
    consumed_carbs = sum(m.carbs_g for m in meal_logs)
    consumed_fat = sum(m.fat_g for m in meal_logs)
    cals_burned = sum(w.calories_burned for w in workout_logs)
    
    return {
        "date": target_date,
        "nutrition": {
            "calories_target": target_cals,
            "calories_consumed": round(consumed_cals, 1),
            "calories_remaining": max(0.0, round(target_cals - consumed_cals, 1)),
            "protein_target_g": target_prot,
            "protein_consumed_g": round(consumed_prot, 1),
            "carbs_target_g": target_carbs,
            "carbs_consumed_g": round(consumed_carbs, 1),
            "fat_target_g": target_fat,
            "fat_consumed_g": round(consumed_fat, 1)
        },
        "workouts": {
            "total_completed": len(workout_logs),
            "calories_burned": round(cals_burned, 1),
            "logs": workout_logs
        },
        "meal_logs": meal_logs
    }

@router.post("/meal", response_model=MealLogOut, status_code=status.HTTP_201_CREATED)
def log_meal(
    meal_in: MealLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = MealLog(
        user_id=current_user.id,
        logged_date=meal_in.logged_date,
        meal_type=meal_in.meal_type,
        food_item_id=meal_in.food_item_id,
        food_name=meal_in.food_name,
        calories=meal_in.calories,
        protein_g=meal_in.protein_g,
        carbs_g=meal_in.carbs_g,
        fat_g=meal_in.fat_g,
        serving_size=meal_in.serving_size,
        serving_unit=meal_in.serving_unit
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.delete("/meal/{meal_id}")
def delete_meal_log(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(MealLog).filter(
        MealLog.id == meal_id,
        MealLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Meal log not found")
        
    db.delete(log)
    db.commit()
    return {"message": "Meal log deleted"}

@router.post("/workout", response_model=WorkoutLogOut, status_code=status.HTTP_201_CREATED)
def log_workout(
    workout_in: WorkoutLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = WorkoutLog(
        user_id=current_user.id,
        logged_date=workout_in.logged_date,
        workout_name=workout_in.workout_name,
        duration_mins=workout_in.duration_mins,
        calories_burned=workout_in.calories_burned,
        difficulty_rating=workout_in.difficulty_rating,
        completed=workout_in.completed,
        notes=workout_in.notes
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
