import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Profile, MealPlan, WorkoutPlan, ProgressLog, Feedback, Recommendation, Notification, ExpertAssignment
from app.core.dependencies import get_current_user, require_role

router = APIRouter(prefix="/expert", tags=["Expert / Nutritionist Dashboard"])

class ExpertNoteRequest(BaseModel):
    user_id: int
    title: str
    message: str
    recommendation_type: str = "general"
    calorie_adjustment: Optional[float] = 0.0

@router.get("/dashboard")
def get_expert_dashboard(
    current_user: User = Depends(require_role(["EXPERT", "ADMIN"])),
    db: Session = Depends(get_db)
):
    # Fetch assigned users (or all users if admin/demo)
    assignments = db.query(ExpertAssignment).filter(ExpertAssignment.expert_id == current_user.id).all()
    assigned_user_ids = [a.user_id for a in assignments]
    
    if not assigned_user_ids:
        # For demo purposes, display all users with role USER
        users = db.query(User).filter(User.role == "USER").all()
    else:
        users = db.query(User).filter(User.id.in_(assigned_user_ids)).all()
        
    user_summaries = []
    needing_attention_count = 0
    total_adh = 0.0
    
    for u in users:
        p = u.profile
        recent_logs = db.query(ProgressLog).filter(ProgressLog.user_id == u.id).order_by(ProgressLog.logged_date.desc()).limit(7).all()
        adh = sum(l.adherence_pct for l in recent_logs) / len(recent_logs) if recent_logs else 75.0
        total_adh += adh
        
        # Check if needs attention (< 65% adherence or high hunger / low energy)
        recent_fb = db.query(Feedback).filter(Feedback.user_id == u.id).order_by(Feedback.logged_date.desc()).first()
        needs_attention = adh < 65.0 or (recent_fb and (recent_fb.energy_level <= 3 or recent_fb.hunger_level >= 8))
        if needs_attention:
            needing_attention_count += 1
            
        user_summaries.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "goal": p.goal if p else "Not set",
            "fitness_archetype": p.fitness_archetype if p else "Beginner",
            "current_weight": p.weight_kg if p else 70.0,
            "target_weight": p.target_weight_kg if p else 65.0,
            "target_calories": p.target_calories if p else 2000.0,
            "adherence_pct": round(adh, 1),
            "needs_attention": needs_attention,
            "last_activity": recent_logs[0].logged_date if recent_logs else u.created_at.strftime("%Y-%m-%d")
        })
        
    avg_system_adh = round(total_adh / max(1, len(users)), 1)
    
    return {
        "expert_name": current_user.full_name,
        "total_assigned_users": len(users),
        "users_needing_attention": needing_attention_count,
        "average_client_adherence": avg_system_adh,
        "users": user_summaries
    }

@router.get("/user/{user_id}")
def get_user_details_for_expert(
    user_id: int,
    current_user: User = Depends(require_role(["EXPERT", "ADMIN"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile = user.profile
    meal_plan = db.query(MealPlan).filter(MealPlan.user_id == user_id).order_by(MealPlan.plan_date.desc()).first()
    workout_plan = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id, WorkoutPlan.status == "active").first()
    feedbacks = db.query(Feedback).filter(Feedback.user_id == user_id).order_by(Feedback.logged_date.desc()).limit(10).all()
    progress_logs = db.query(ProgressLog).filter(ProgressLog.user_id == user_id).order_by(ProgressLog.logged_date.desc()).limit(14).all()
    recs = db.query(Recommendation).filter(Recommendation.user_id == user_id).order_by(Recommendation.created_at.desc()).all()
    
    return {
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "created_at": user.created_at
        },
        "profile": profile,
        "meal_plan": meal_plan,
        "workout_plan": workout_plan,
        "recent_feedbacks": feedbacks,
        "progress_logs": progress_logs,
        "recommendations": recs
    }

@router.post("/user/note")
def add_expert_recommendation_note(
    payload: ExpertNoteRequest,
    current_user: User = Depends(require_role(["EXPERT", "ADMIN"])),
    db: Session = Depends(get_db)
):
    rec = Recommendation(
        user_id=payload.user_id,
        rec_type=payload.recommendation_type,
        title=f"Expert Review from {current_user.full_name}: {payload.title}",
        message=payload.message,
        reason=f"Clinical & sports nutrition assessment provided by Certified Expert {current_user.full_name}.",
        impact_calories=payload.calorie_adjustment or 0.0,
        status="active"
    )
    db.add(rec)
    
    notif = Notification(
        user_id=payload.user_id,
        title=f"👨‍⚕️ Expert Feedback: {payload.title}",
        message=f"{current_user.full_name} reviewed your progress: {payload.message}",
        type="info"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(rec)
    return {"message": "Expert recommendation attached and notification dispatched", "recommendation_id": rec.id}
