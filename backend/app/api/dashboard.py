import datetime
import json
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import (
    User, Profile, MealPlan, MealPlanItem, WorkoutPlan, WorkoutPlanExercise,
    MealLog, WorkoutLog, ProgressLog, Recommendation, Notification
)
from app.core.dependencies import get_current_user
from app.ml.diet_engine import generate_diet_plan

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_user_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        return {
            "has_profile": False,
            "message": "Please complete your onboarding profile to unlock your personalized AI recommendations."
        }
        
    today_str = datetime.date.today().isoformat()
    
    # 1. Fetch or generate Today's Diet Plan
    today_meal_plan = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id,
        MealPlan.plan_date == today_str
    ).first()
    
    if not today_meal_plan:
        allergies = json.loads(profile.allergies) if profile.allergies else []
        today_meal_plan = generate_diet_plan(
            db=db,
            user_id=current_user.id,
            plan_date=today_str,
            target_calories=profile.target_calories,
            target_protein=profile.target_protein,
            target_carbs=profile.target_carbs,
            target_fat=profile.target_fat,
            goal=profile.goal,
            dietary_pref=profile.dietary_preference,
            allergies=allergies
        )

    # 2. Fetch or load active Workout Plan
    workout_plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.status == "active"
    ).first()
    
    # 3. Calculate Weekly Adherence and Consumption Stats
    start_week = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()
    recent_logs = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id,
        ProgressLog.logged_date >= start_week
    ).all()
    
    avg_adherence = 82.0
    if recent_logs:
        avg_adherence = round(sum(log.adherence_pct for log in recent_logs) / len(recent_logs), 1)
        
    # Today's Meal logs for tracker summary
    today_meal_logs = db.query(MealLog).filter(
        MealLog.user_id == current_user.id,
        MealLog.logged_date == today_str
    ).all()
    
    consumed_calories = sum(m.calories for m in today_meal_logs)
    consumed_protein = sum(m.protein_g for m in today_meal_logs)
    consumed_carbs = sum(m.carbs_g for m in today_meal_logs)
    consumed_fat = sum(m.fat_g for m in today_meal_logs)
    
    # Recent Active Recommendations / Insights
    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(Recommendation.created_at.desc()).limit(3).all()
    
    # Unread notifications count
    unread_notifs_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()

    return {
        "has_profile": True,
        "user_name": current_user.full_name,
        "user_email": current_user.email,
        "fitness_archetype": profile.fitness_archetype,
        "summary": {
            "current_weight": profile.weight_kg,
            "target_weight": profile.target_weight_kg,
            "daily_calories_target": profile.target_calories,
            "calories_consumed": round(consumed_calories, 1),
            "calories_remaining": max(0.0, round(profile.target_calories - consumed_calories, 1)),
            "protein_target_g": profile.target_protein,
            "protein_consumed_g": round(consumed_protein, 1),
            "carbs_target_g": profile.target_carbs,
            "carbs_consumed_g": round(consumed_carbs, 1),
            "fat_target_g": profile.target_fat,
            "fat_consumed_g": round(consumed_fat, 1),
            "water_goal_liters": profile.water_goal_liters,
            "weekly_adherence_pct": avg_adherence,
            "unread_notifications": unread_notifs_count
        },
        "today_diet": {
            "id": today_meal_plan.id,
            "plan_date": today_meal_plan.plan_date,
            "total_calories": today_meal_plan.total_calories,
            "total_protein": today_meal_plan.total_protein,
            "total_carbs": today_meal_plan.total_carbs,
            "total_fat": today_meal_plan.total_fat,
            "explanation": today_meal_plan.explanation,
            "meals": [
                {
                    "id": item.id,
                    "meal_type": item.meal_type,
                    "food_name": item.custom_name,
                    "calories": item.calories,
                    "protein_g": item.protein_g,
                    "carbs_g": item.carbs_g,
                    "fat_g": item.fat_g,
                    "serving_amount": item.serving_amount,
                    "serving_unit": item.serving_unit,
                    "meal_time": item.meal_time,
                    "reason": item.reason,
                    "food_item_id": item.food_item_id
                }
                for item in today_meal_plan.items
            ]
        },
        "today_workout": {
            "id": workout_plan.id if workout_plan else None,
            "name": workout_plan.name if workout_plan else "Daily Full-Body Conditioning",
            "archetype": workout_plan.archetype if workout_plan else profile.fitness_archetype,
            "ai_notes": workout_plan.ai_notes if workout_plan else "Tailored for your recovery and muscle-building balance.",
            "exercises": [
                {
                    "id": ex.id,
                    "exercise_name": ex.exercise_name,
                    "category": ex.category,
                    "target_muscle": ex.target_muscle,
                    "sets": ex.sets,
                    "reps": ex.reps,
                    "duration_sec": ex.duration_sec,
                    "rest_sec": ex.rest_sec,
                    "completed": ex.completed,
                    "notes": ex.notes
                }
                for ex in (workout_plan.exercises if workout_plan else [])
            ]
        },
        "ai_recommendations": [
            {
                "id": r.id,
                "type": r.rec_type,
                "title": r.title,
                "message": r.message,
                "reason": r.reason,
                "impact_calories": r.impact_calories,
                "impact_protein": r.impact_protein,
                "status": r.status,
                "created_at": r.created_at
            }
            for r in recommendations
        ]
    }
