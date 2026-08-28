import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import (
    User, Profile, WorkoutTemplate, WorkoutTemplateExercise,
    WorkoutPlan, WorkoutPlanExercise, WorkoutLog
)
from app.schemas.workout import (
    WorkoutPlanOut, WorkoutExerciseToggle, WorkoutLogCreate, WorkoutLogOut, WorkoutTemplateOut
)
from app.core.dependencies import get_current_user
from app.ml.prediction.archetype_clusterer import assign_fitness_archetype

router = APIRouter(prefix="/workout", tags=["Workouts & Exercise Plans"])

@router.get("/templates", response_model=List[WorkoutTemplateOut])
def get_workout_templates(
    archetype: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(WorkoutTemplate)
    if archetype:
        q = q.filter(WorkoutTemplate.archetype == archetype)
    return q.all()

@router.get("/plan", response_model=WorkoutPlanOut)
def get_my_workout_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.status == "active"
    ).first()
    
    if not plan:
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        archetype = profile.fitness_archetype if profile else "Lean Muscle Gain"
        
        # Look up template for this archetype
        template = db.query(WorkoutTemplate).filter(WorkoutTemplate.archetype == archetype).first()
        if not template:
            template = db.query(WorkoutTemplate).first()
            
        week_start = datetime.date.today().isoformat()
        plan = WorkoutPlan(
            user_id=current_user.id,
            archetype=archetype,
            name=template.name if template else f"{archetype} Routine",
            week_start_date=week_start,
            status="active",
            ai_notes=f"Personalized weekly training split dynamically mapped from your '{archetype}' cluster."
        )
        db.add(plan)
        db.flush()
        
        if template:
            for ex in template.exercises:
                plan_ex = WorkoutPlanExercise(
                    workout_plan_id=plan.id,
                    day_name=ex.day_of_week,
                    exercise_name=ex.exercise_name,
                    category=ex.category,
                    target_muscle=ex.target_muscle,
                    sets=ex.sets,
                    reps=ex.reps,
                    duration_sec=ex.duration_sec,
                    rest_sec=ex.rest_sec,
                    completed=False,
                    notes=ex.notes
                )
                db.add(plan_ex)
                
        db.commit()
        db.refresh(plan)
        
    return plan

@router.post("/generate", response_model=WorkoutPlanOut)
def regenerate_workout_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="User profile is required to generate workout plan")
        
    # Re-cluster archetype
    cluster_res = assign_fitness_archetype(
        age=profile.age,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        goal=profile.goal,
        activity_level=profile.activity_level,
        sleep_hours=profile.sleep_hours
    )
    profile.fitness_archetype = cluster_res["archetype"]
    
    # Archive old plans
    db.query(WorkoutPlan).filter(
        WorkoutPlan.user_id == current_user.id,
        WorkoutPlan.status == "active"
    ).update({"status": "archived"})
    
    template = db.query(WorkoutTemplate).filter(WorkoutTemplate.archetype == cluster_res["archetype"]).first()
    if not template:
        template = db.query(WorkoutTemplate).first()
        
    new_plan = WorkoutPlan(
        user_id=current_user.id,
        archetype=cluster_res["archetype"],
        name=template.name if template else f"{cluster_res['archetype']} Split",
        week_start_date=datetime.date.today().isoformat(),
        status="active",
        ai_notes=f"Auto-generated for {cluster_res['archetype']} using {cluster_res['method']}."
    )
    db.add(new_plan)
    db.flush()
    
    if template:
        for ex in template.exercises:
            plan_ex = WorkoutPlanExercise(
                workout_plan_id=new_plan.id,
                day_name=ex.day_of_week,
                exercise_name=ex.exercise_name,
                category=ex.category,
                target_muscle=ex.target_muscle,
                sets=ex.sets,
                reps=ex.reps,
                duration_sec=ex.duration_sec,
                rest_sec=ex.rest_sec,
                completed=False,
                notes=ex.notes
            )
            db.add(plan_ex)
            
    db.commit()
    db.refresh(new_plan)
    return new_plan

@router.post("/toggle-exercise")
def toggle_exercise_completed(
    payload: WorkoutExerciseToggle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ex = db.query(WorkoutPlanExercise).filter(WorkoutPlanExercise.id == payload.exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
        
    ex.completed = payload.completed
    db.commit()
    return {"message": "Exercise status updated", "exercise_id": ex.id, "completed": ex.completed}

@router.post("/complete")
def mark_workout_complete(
    log_data: WorkoutLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = WorkoutLog(
        user_id=current_user.id,
        logged_date=log_data.logged_date,
        workout_name=log_data.workout_name,
        duration_mins=log_data.duration_mins,
        calories_burned=log_data.calories_burned,
        difficulty_rating=log_data.difficulty_rating,
        completed=True,
        notes=log_data.notes
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return {"message": "Workout session logged successfully", "log_id": log.id}
