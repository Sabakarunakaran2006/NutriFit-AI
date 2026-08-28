import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import User, Profile, Feedback, ProgressLog, WorkoutLog, Recommendation, Notification
from app.services.nutrition_calculator import calculate_nutrition_targets

def process_adaptive_feedback(db: Session, user_id: int, feedback_id: int) -> Dict[str, Any]:
    """
    Core Adaptive Feedback System:
    Analyzes user feedback, recent workout adherence, and weight delta trends
    to dynamically calibrate calorie targets, macronutrient splits, and workout volume.
    Generates transparent Explainable AI justifications.
    """
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id, Feedback.user_id == user_id).first()
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    
    if not feedback or not profile:
        return {"error": "Feedback or profile not found"}
        
    # Get last 7 progress logs
    recent_logs = db.query(ProgressLog).filter(
        ProgressLog.user_id == user_id
    ).order_by(ProgressLog.logged_date.desc()).limit(7).all()
    
    # Get recent workouts
    recent_workouts = db.query(WorkoutLog).filter(
        WorkoutLog.user_id == user_id
    ).order_by(WorkoutLog.logged_date.desc()).limit(7).all()
    
    completed_workouts_count = sum(1 for w in recent_workouts if w.completed)
    workout_completion_rate = (completed_workouts_count / max(1, len(recent_workouts))) * 100.0 if recent_workouts else 80.0
    
    old_cals = profile.target_calories
    old_prot = profile.target_protein
    cal_adjustment = 0.0
    prot_adjustment = 0.0
    workout_adjustment = None
    ai_insights = []
    
    # 1. Evaluate Energy & Hunger levels
    if feedback.hunger_level >= 8 and profile.goal == "weight_loss":
        # Extreme hunger during deficit -> raise calories slightly with fibrous volume
        cal_adjustment += 120.0
        prot_adjustment += 10.0
        ai_insights.append(
            f"High hunger rating ({feedback.hunger_level}/10) detected. Calorie target raised by +120 kcal "
            f"and protein by +10g to prevent metabolic burnout and sustain adherence."
        )
    elif feedback.energy_level <= 3:
        cal_adjustment += 100.0
        ai_insights.append(
            f"Low energy score ({feedback.energy_level}/10) logged. Added +100 kcal carbohydrate reserve "
            f"for central nervous system recovery."
        )
        
    # 2. Evaluate Workout Difficulty & Completion Rate
    if feedback.workout_difficulty == "too_difficult" or workout_completion_rate < 60.0:
        workout_adjustment = "Reduced session volume (-1 set per exercise) and extended rest intervals by 15s."
        ai_insights.append(
            f"Workout completion rate was {workout_completion_rate:.0f}% with high perceived exertion. "
            f"Training volume reduced to promote neuromuscular recovery."
        )
    elif feedback.workout_difficulty == "too_easy" and workout_completion_rate >= 90.0:
        workout_adjustment = "Increased progressive overload intensity (+1 set or +2.5kg resistance recommendation)."
        ai_insights.append(
            f"High workout adherence ({workout_completion_rate:.0f}%) and low perceived difficulty. "
            f"Recommended advancing resistance parameters."
        )
        
    # 3. Evaluate Weight Progress Trend
    if len(recent_logs) >= 3:
        latest_weight = recent_logs[0].weight_kg
        oldest_weight = recent_logs[-1].weight_kg
        weight_delta = latest_weight - oldest_weight
        
        if profile.goal == "weight_loss" and weight_delta >= 0.2 and feedback.followed_diet:
            # Plateaued or slight gain while adhering -> safe calibrated reduction
            cal_adjustment -= 100.0
            ai_insights.append(
                f"Weight plateau detected over recent logs ({latest_weight} kg). Adjusted daily caloric target "
                f"by -100 kcal within safe clinical limits."
            )
        elif profile.goal == "muscle_gain" and weight_delta <= -0.2:
            cal_adjustment += 150.0
            prot_adjustment += 10.0
            ai_insights.append(
                f"Weight decreased during hypertrophy phase. Increased daily surplus by +150 kcal and +10g protein."
            )

    # If no major flags triggered, confirm stability
    if not ai_insights:
        ai_insights.append(
            f"Your current adherence ({feedback.diet_rating}/5 diet, {feedback.workout_rating}/5 workout) "
            f"is well-aligned with your {profile.goal.replace('_', ' ')} target. Maintaining current plan."
        )
        
    # Apply safe bounds to calorie adjustments
    new_cals = max(1200.0, min(4000.0, old_cals + cal_adjustment))
    new_prot = max(50.0, min(300.0, old_prot + prot_adjustment))
    
    # Update profile
    profile.target_calories = round(new_cals, 0)
    profile.target_protein = round(new_prot, 1)
    profile.ml_caloric_adjustment += cal_adjustment
    
    explanation_text = " | ".join(ai_insights)
    feedback.processed = True
    feedback.ai_response = explanation_text
    
    # Create Recommendation entity
    rec = Recommendation(
        user_id=user_id,
        rec_type="adaptive",
        title="Adaptive AI Plan Recalibration",
        message=f"Target updated: {new_cals:.0f} kcal ({new_prot:.0f}g Protein). {workout_adjustment or 'Workouts on track.'}",
        reason=explanation_text,
        impact_calories=cal_adjustment,
        impact_protein=prot_adjustment,
        status="active"
    )
    db.add(rec)
    
    # Create notification
    notif = Notification(
        user_id=user_id,
        title="🤖 AI Recommendation Recalibrated",
        message=f"Based on your daily check-in, your targets were adjusted to {new_cals:.0f} kcal. Reason: {ai_insights[0]}",
        type="info"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(profile)
    db.refresh(rec)
    
    return {
        "feedback_id": feedback.id,
        "old_target_calories": old_cals,
        "new_target_calories": new_cals,
        "old_target_protein": old_prot,
        "new_target_protein": new_prot,
        "adjustment_reason": explanation_text,
        "workout_adjustment": workout_adjustment,
        "ai_explanation": explanation_text,
        "applied_recommendation": rec
    }
