import os
import joblib
import pandas as pd
from typing import Dict, Any
from app.services.nutrition_calculator import calculate_nutrition_targets

MODEL_PATH = "./app/ml/models/best_calorie_model.joblib"
METADATA_PATH = "./app/ml/models/model_metadata.joblib"

_cached_model = None
_cached_metadata = None

def get_loaded_calorie_model():
    global _cached_model, _cached_metadata
    if _cached_model is None and os.path.exists(MODEL_PATH):
        try:
            _cached_model = joblib.load(MODEL_PATH)
            if os.path.exists(METADATA_PATH):
                _cached_metadata = joblib.load(METADATA_PATH)
        except Exception as e:
            print(f"Warning: Could not load trained ML model from {MODEL_PATH}: {e}")
            _cached_model = None
    return _cached_model, _cached_metadata

def predict_calorie_and_macros(
    age: int,
    gender: str,
    height_cm: float,
    weight_kg: float,
    target_weight_kg: float,
    goal: str,
    activity_level: str,
    dietary_preference: str = "non_vegetarian",
    sleep_hours: float = 7.5,
    stress_level: str = "moderate",
    ml_caloric_offset: float = 0.0
) -> Dict[str, Any]:
    """
    Combines machine learning prediction with domain nutrition equations
    to produce accurate, personalized, and safe caloric & macronutrient targets.
    """
    stress_score_map = {"low": 3, "moderate": 6, "high": 9}
    stress_score = stress_score_map.get(stress_level.lower(), 5)
    
    baseline = calculate_nutrition_targets(
        age=age,
        gender=gender,
        height_cm=height_cm,
        weight_kg=weight_kg,
        target_weight_kg=target_weight_kg,
        goal=goal,
        activity_level=activity_level,
        dietary_preference=dietary_preference,
        ml_caloric_offset=ml_caloric_offset
    )
    
    model, metadata = get_loaded_calorie_model()
    
    if model is not None:
        try:
            input_df = pd.DataFrame([{
                "age": age,
                "gender": gender,
                "height_cm": height_cm,
                "weight_kg": weight_kg,
                "goal": goal,
                "activity_level": activity_level,
                "dietary_preference": dietary_preference,
                "sleep_hours": sleep_hours,
                "stress_score": stress_score
            }])
            
            ml_pred = float(model.predict(input_df)[0])
            # Bound ML prediction within +/- 15% of scientifically validated baseline to guarantee safety
            safe_lower = baseline["target_calories"] * 0.85
            safe_upper = baseline["target_calories"] * 1.15
            blended_calories = round(min(safe_upper, max(safe_lower, (0.4 * ml_pred + 0.6 * baseline["target_calories"]))), 0)
            
            best_alg = metadata.get("best_model_name", "Gradient Boosting Regressor") if metadata else "ML Ensemble"
            
            baseline["target_calories"] = blended_calories
            baseline["ml_model_used"] = best_alg
            baseline["ml_raw_prediction"] = round(ml_pred, 1)
            baseline["explanation"] = (
                f"Personalized target of {blended_calories} kcal synthesized using {best_alg} "
                f"and Mifflin-St Jeor metabolic baseline for {goal.replace('_', ' ')}."
            )
        except Exception as e:
            baseline["ml_model_used"] = "Fallback Baseline (Equation Engine)"
    else:
        baseline["ml_model_used"] = "Standard Scientific Engine (Mifflin-St Jeor)"
        
    return baseline
