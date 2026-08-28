import os
import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
from app.ml.data.synthetic_data_generator import generate_synthetic_user_nutrition_dataset

ARCHETYPE_LABELS = {
    0: "Beginner / General Fitness",
    1: "Fat Loss Accelerator",
    2: "Lean Muscle Gain",
    3: "Strength & Power Builder",
    4: "Endurance Athlete"
}

def train_fitness_archetype_clustering(data_path: str = None, models_dir: str = "./app/ml/models"):
    """
    Applies unsupervised K-Means clustering on biometric, lifestyle, and fitness features
    to automatically categorize users into fitness archetypes and map them to targeted workout routines.
    """
    os.makedirs(models_dir, exist_ok=True)
    
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        csv_path = "./app/ml/data/user_nutrition_dataset.csv"
        df = generate_synthetic_user_nutrition_dataset(3000, csv_path)
        
    # Calculate BMI and numerical representations
    df["bmi"] = df["weight_kg"] / ((df["height_cm"] / 100.0) ** 2)
    
    goal_map = {"weight_loss": 1.0, "muscle_gain": 2.0, "maintenance": 0.0, "endurance": 3.0}
    act_map = {"sedentary": 1.0, "light": 2.0, "moderate": 3.0, "active": 4.0, "very_active": 5.0}
    
    df["goal_encoded"] = df["goal"].map(goal_map).fillna(0.0)
    df["activity_encoded"] = df["activity_level"].map(act_map).fillna(3.0)
    
    feature_cols = ["age", "bmi", "activity_encoded", "goal_encoded", "workout_freq", "sleep_hours"]
    X = df[feature_cols].values
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
    cluster_assignments = kmeans.fit_predict(X_scaled)
    
    silhouette = silhouette_score(X_scaled, cluster_assignments)
    
    save_path = os.path.join(models_dir, "kmeans_archetype.joblib")
    scaler_path = os.path.join(models_dir, "kmeans_scaler.joblib")
    
    joblib.dump(kmeans, save_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"\n--- Trained K-Means User Clustering (k=5) ---")
    print(f"Silhouette Score: {silhouette:.4f}")
    print(f"Saved clustering model to: {save_path}")
    
    return {
        "silhouette_score": round(float(silhouette), 4),
        "n_clusters": 5,
        "model_path": save_path
    }

if __name__ == "__main__":
    train_fitness_archetype_clustering()
