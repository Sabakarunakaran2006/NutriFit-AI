import os
import joblib
import numpy as np
from typing import Dict, Any

KMEANS_MODEL_PATH = "./app/ml/models/kmeans_archetype.joblib"
KMEANS_SCALER_PATH = "./app/ml/models/kmeans_scaler.joblib"

_cached_kmeans = None
_cached_scaler = None

ARCHETYPES = [
    "Beginner / General Fitness",
    "Fat Loss Accelerator",
    "Lean Muscle Gain",
    "Strength & Power Builder",
    "Endurance Athlete"
]

def get_loaded_clustering_model():
    global _cached_kmeans, _cached_scaler
    if _cached_kmeans is None and os.path.exists(KMEANS_MODEL_PATH) and os.path.exists(KMEANS_SCALER_PATH):
        try:
            _cached_kmeans = joblib.load(KMEANS_MODEL_PATH)
            _cached_scaler = joblib.load(KMEANS_SCALER_PATH)
        except Exception as e:
            print(f"Warning: Could not load K-Means model: {e}")
            _cached_kmeans = None
            _cached_scaler = None
    return _cached_kmeans, _cached_scaler

def assign_fitness_archetype(
    age: int,
    height_cm: float,
    weight_kg: float,
    goal: str,
    activity_level: str,
    sleep_hours: float = 7.5,
    workout_freq: int = 4
) -> Dict[str, Any]:
    """
    Predicts the user's fitness archetype using K-Means clustering or heuristic fallback.
    """
    bmi = weight_kg / ((height_cm / 100.0) ** 2)
    
    kmeans, scaler = get_loaded_clustering_model()
    
    if kmeans is not None and scaler is not None:
        try:
            goal_map = {"weight_loss": 1.0, "muscle_gain": 2.0, "maintenance": 0.0, "endurance": 3.0}
            act_map = {"sedentary": 1.0, "light": 2.0, "moderate": 3.0, "active": 4.0, "very_active": 5.0}
            
            features = np.array([[
                age,
                bmi,
                act_map.get(activity_level.lower(), 3.0),
                goal_map.get(goal.lower(), 0.0),
                workout_freq,
                sleep_hours
            ]])
            
            scaled_features = scaler.transform(features)
            cluster_idx = int(kmeans.predict(scaled_features)[0])
            archetype_name = ARCHETYPES[cluster_idx % len(ARCHETYPES)]
            
            return {
                "archetype": archetype_name,
                "cluster_index": cluster_idx,
                "method": "K-Means Unsupervised Clustering (k=5)",
                "bmi": round(bmi, 1)
            }
        except Exception:
            pass
            
    # Rule-based fallback
    goal_lower = goal.lower()
    if goal_lower == "weight_loss":
        archetype = "Fat Loss Accelerator"
    elif goal_lower == "muscle_gain":
        archetype = "Lean Muscle Gain"
    elif goal_lower == "endurance":
        archetype = "Endurance Athlete"
    elif activity_level.lower() in ["active", "very_active"]:
        archetype = "Strength & Power Builder"
    else:
        archetype = "Beginner / General Fitness"
        
    return {
        "archetype": archetype,
        "cluster_index": 0,
        "method": "Biometric Heuristic Archetype Classifier",
        "bmi": round(bmi, 1)
    }
