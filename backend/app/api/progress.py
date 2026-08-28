import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Profile, ProgressLog, WorkoutLog, MealLog
from app.schemas.progress import ProgressLogCreate, ProgressLogOut, ProgressSummary, ProgressTimeSeriesPoint
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])

@router.get("/", response_model=ProgressSummary)
def get_progress_overview(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Profile required for progress analysis")
        
    start_date = (datetime.date.today() - datetime.timedelta(days=days)).isoformat()
    
    logs = db.query(ProgressLog).filter(
        ProgressLog.user_id == current_user.id,
        ProgressLog.logged_date >= start_date
    ).order_by(ProgressLog.logged_date.asc()).all()
    
    workouts = db.query(WorkoutLog).filter(
        WorkoutLog.user_id == current_user.id,
        WorkoutLog.logged_date >= start_date
    ).all()
    workout_dates = {w.logged_date for w in workouts if w.completed}
    
    time_series: List[ProgressTimeSeriesPoint] = []
    
    # Generate points
    if logs:
        starting_weight = logs[0].weight_kg
        current_weight = logs[-1].weight_kg
        for log in logs:
            time_series.append(ProgressTimeSeriesPoint(
                date=log.logged_date,
                weight=log.weight_kg,
                target_weight=profile.target_weight_kg,
                calories_actual=log.calories_consumed,
                calories_target=profile.target_calories,
                protein_actual=log.protein_consumed,
                protein_target=profile.target_protein,
                water_liters=log.water_liters,
                sleep_hours=log.sleep_hours,
                adherence_pct=log.adherence_pct,
                workout_completed=log.logged_date in workout_dates
            ))
    else:
        starting_weight = profile.weight_kg
        current_weight = profile.weight_kg
        # Seed 7 initial points if fresh
        for i in range(7, 0, -1):
            d = (datetime.date.today() - datetime.timedelta(days=i)).isoformat()
            time_series.append(ProgressTimeSeriesPoint(
                date=d,
                weight=profile.weight_kg + (i * 0.1),
                target_weight=profile.target_weight_kg,
                calories_actual=profile.target_calories - (i * 20),
                calories_target=profile.target_calories,
                protein_actual=profile.target_protein - (i * 2),
                protein_target=profile.target_protein,
                water_liters=2.8,
                sleep_hours=7.2,
                adherence_pct=85.0 - (i * 1.5),
                workout_completed=i % 2 == 0
            ))

    avg_cals = sum(p.calories_actual for p in time_series) / max(1, len(time_series))
    avg_prot = sum(p.protein_actual for p in time_series) / max(1, len(time_series))
    avg_water = sum(p.water_liters for p in time_series) / max(1, len(time_series))
    avg_sleep = sum(p.sleep_hours for p in time_series) / max(1, len(time_series))
    avg_adh = sum(p.adherence_pct for p in time_series) / max(1, len(time_series))

    return ProgressSummary(
        current_weight=current_weight,
        starting_weight=starting_weight,
        target_weight=profile.target_weight_kg,
        weight_change=round(current_weight - starting_weight, 1),
        avg_calories=round(avg_cals, 1),
        avg_protein=round(avg_prot, 1),
        avg_water=round(avg_water, 1),
        avg_sleep=round(avg_sleep, 1),
        avg_adherence=round(avg_adh, 1),
        total_workouts_completed=len(workout_dates),
        time_series=time_series
    )

@router.post("/", response_model=ProgressLogOut, status_code=status.HTTP_201_CREATED)
def log_progress_entry(
    log_in: ProgressLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    # Calculate adherence score
    target_cals = profile.target_calories if profile else 2000.0
    cal_adherence = max(0.0, 100.0 - (abs(log_in.calories_consumed - target_cals) / target_cals) * 100.0) if log_in.calories_consumed > 0 else 80.0
    
    # Update profile weight
    if profile:
        profile.weight_kg = log_in.weight_kg
        
    entry = ProgressLog(
        user_id=current_user.id,
        logged_date=log_in.logged_date,
        weight_kg=log_in.weight_kg,
        calories_consumed=log_in.calories_consumed or 0.0,
        protein_consumed=log_in.protein_consumed or 0.0,
        water_liters=log_in.water_liters or 2.5,
        sleep_hours=log_in.sleep_hours or 7.0,
        energy_level=log_in.energy_level or 7,
        adherence_pct=round(cal_adherence, 1),
        notes=log_in.notes or ""
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
