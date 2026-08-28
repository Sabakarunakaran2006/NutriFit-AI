import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, Profile, Recommendation, Notification
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileOut, NutritionTargets
from app.core.dependencies import get_current_user
from app.ml.prediction.calorie_predictor import predict_calorie_and_macros
from app.ml.prediction.archetype_clusterer import assign_fitness_archetype

router = APIRouter(prefix="/profile", tags=["Profile & Onboarding"])

@router.post("/", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
def create_or_onboard_profile(
    profile_in: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists. Use PUT /profile to update."
        )
        
    # ML & Baseline Calculation
    nutr = predict_calorie_and_macros(
        age=profile_in.age,
        gender=profile_in.gender,
        height_cm=profile_in.height_cm,
        weight_kg=profile_in.weight_kg,
        target_weight_kg=profile_in.target_weight_kg,
        goal=profile_in.goal,
        activity_level=profile_in.activity_level,
        dietary_preference=profile_in.dietary_preference,
        sleep_hours=profile_in.sleep_hours,
        stress_level=profile_in.stress_level
    )
    
    # Archetype Clustering
    archetype_res = assign_fitness_archetype(
        age=profile_in.age,
        height_cm=profile_in.height_cm,
        weight_kg=profile_in.weight_kg,
        goal=profile_in.goal,
        activity_level=profile_in.activity_level,
        sleep_hours=profile_in.sleep_hours
    )
    
    profile = Profile(
        user_id=current_user.id,
        age=profile_in.age,
        gender=profile_in.gender,
        height_cm=profile_in.height_cm,
        weight_kg=profile_in.weight_kg,
        target_weight_kg=profile_in.target_weight_kg,
        goal=profile_in.goal,
        activity_level=profile_in.activity_level,
        dietary_preference=profile_in.dietary_preference,
        allergies=json.dumps(profile_in.allergies),
        health_conditions=json.dumps(profile_in.health_conditions),
        sleep_hours=profile_in.sleep_hours,
        stress_level=profile_in.stress_level,
        meal_frequency=profile_in.meal_frequency,
        bmr=nutr["bmr"],
        tdee=nutr["tdee"],
        target_calories=nutr["target_calories"],
        target_protein=nutr["target_protein"],
        target_carbs=nutr["target_carbs"],
        target_fat=nutr["target_fat"],
        water_goal_liters=nutr["water_goal_liters"],
        fitness_archetype=archetype_res["archetype"]
    )
    db.add(profile)
    
    # Welcome Notification & Initial Recommendation
    rec = Recommendation(
        user_id=current_user.id,
        rec_type="general",
        title="Welcome to your AI Health Plan!",
        message=f"Targets initialized: {nutr['target_calories']:.0f} kcal, {nutr['target_protein']:.0f}g Protein. Assigned Archetype: '{archetype_res['archetype']}'.",
        reason=nutr["explanation"],
        status="active"
    )
    db.add(rec)
    
    notif = Notification(
        user_id=current_user.id,
        title="🎉 Profile Configured",
        message="Your personalized AI nutritional and workout plan has been generated.",
        type="success"
    )
    db.add(notif)
    
    db.commit()
    db.refresh(profile)
    
    profile_dict = profile.__dict__.copy()
    profile_dict["allergies"] = json.loads(profile.allergies) if profile.allergies else []
    profile_dict["health_conditions"] = json.loads(profile.health_conditions) if profile.health_conditions else []
    return profile_dict

@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete onboarding.")
    profile_dict = profile.__dict__.copy()
    profile_dict["allergies"] = json.loads(profile.allergies) if profile.allergies else []
    profile_dict["health_conditions"] = json.loads(profile.health_conditions) if profile.health_conditions else []
    return profile_dict

@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please create one first.")
        
    for field, val in profile_in.dict(exclude_unset=True).items():
        if field in ["allergies", "health_conditions"] and val is not None:
            setattr(profile, field, json.dumps(val))
        elif val is not None:
            setattr(profile, field, val)
            
    # Recalculate targets
    allergies_list = json.loads(profile.allergies) if profile.allergies else []
    nutr = predict_calorie_and_macros(
        age=profile.age,
        gender=profile.gender,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        target_weight_kg=profile.target_weight_kg,
        goal=profile.goal,
        activity_level=profile.activity_level,
        dietary_preference=profile.dietary_preference,
        sleep_hours=profile.sleep_hours,
        stress_level=profile.stress_level,
        ml_caloric_offset=profile.ml_caloric_adjustment
    )
    
    archetype_res = assign_fitness_archetype(
        age=profile.age,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        goal=profile.goal,
        activity_level=profile.activity_level,
        sleep_hours=profile.sleep_hours
    )
    
    profile.bmr = nutr["bmr"]
    profile.tdee = nutr["tdee"]
    profile.target_calories = nutr["target_calories"]
    profile.target_protein = nutr["target_protein"]
    profile.target_carbs = nutr["target_carbs"]
    profile.target_fat = nutr["target_fat"]
    profile.water_goal_liters = nutr["water_goal_liters"]
    profile.fitness_archetype = archetype_res["archetype"]
    
    db.commit()
    db.refresh(profile)
    
    profile_dict = profile.__dict__.copy()
    profile_dict["allergies"] = allergies_list
    profile_dict["health_conditions"] = json.loads(profile.health_conditions) if profile.health_conditions else []
    return profile_dict
