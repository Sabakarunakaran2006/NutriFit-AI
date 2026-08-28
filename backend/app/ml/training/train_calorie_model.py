import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from app.ml.data.synthetic_data_generator import generate_synthetic_user_nutrition_dataset

def train_and_compare_calorie_models(data_path: str = None, models_dir: str = "./app/ml/models"):
    """
    Trains multiple regression algorithms (Linear Regression, Random Forest, Gradient Boosting)
    to predict target calorie and macro requirements from user biometrics, activity, and goals.
    Evaluates MAE, RMSE, and R2, selects the best model, and serializes it with joblib.
    """
    os.makedirs(models_dir, exist_ok=True)
    
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        csv_path = "./app/ml/data/user_nutrition_dataset.csv"
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        df = generate_synthetic_user_nutrition_dataset(3500, csv_path)
        
    features = ["age", "gender", "height_cm", "weight_kg", "goal", "activity_level", "dietary_preference", "sleep_hours", "stress_score"]
    numeric_features = ["age", "height_cm", "weight_kg", "sleep_hours", "stress_score"]
    categorical_features = ["gender", "goal", "activity_level", "dietary_preference"]
    
    X = df[features]
    y_calories = df["target_calories"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_calories, test_size=0.2, random_state=42)
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), categorical_features)
        ]
    )
    
    candidate_models = {
        "Linear Regression": LinearRegression(),
        "Random Forest Regressor": RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42),
        "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=120, learning_rate=0.08, max_depth=5, random_state=42)
    }
    
    results = {}
    best_name = None
    best_score = -float("inf")
    best_pipeline = None
    
    print("\n--- Training Caloric Regression Models ---")
    for name, model in candidate_models.items():
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("regressor", model)
        ])
        
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        results[name] = {
            "mae": round(float(mae), 3),
            "rmse": round(float(rmse), 3),
            "r2": round(float(r2), 4),
            "model_instance": pipeline
        }
        
        print(f"[{name}] MAE: {mae:.2f} kcal | RMSE: {rmse:.2f} kcal | R2 Score: {r2:.4f}")
        
        if r2 > best_score:
            best_score = r2
            best_name = name
            best_pipeline = pipeline
            
    # Serialize the best pipeline
    model_save_path = os.path.join(models_dir, "best_calorie_model.joblib")
    metadata_save_path = os.path.join(models_dir, "model_metadata.joblib")
    
    joblib.dump(best_pipeline, model_save_path)
    joblib.dump({
        "best_model_name": best_name,
        "features": features,
        "metrics": {k: {"mae": v["mae"], "rmse": v["rmse"], "r2": v["r2"]} for k, v in results.items()},
        "best_r2": best_score
    }, metadata_save_path)
    
    print(f"\n[OK] Best Model Selected: {best_name} (R2 = {best_score:.4f})")
    print(f"Saved to: {model_save_path}")
    
    return {
        "best_model_name": best_name,
        "results": {k: {"mae": v["mae"], "rmse": v["rmse"], "r2": v["r2"]} for k, v in results.items()},
        "model_path": model_save_path
    }

if __name__ == "__main__":
    train_and_compare_calorie_models()
