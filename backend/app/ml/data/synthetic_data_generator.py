import os
import random
import pandas as pd
import numpy as np

def generate_synthetic_user_nutrition_dataset(num_samples: int = 3000, output_path: str = None) -> pd.DataFrame:
    """
    Generates a realistic demographic, biometric, and nutritional dataset
    for training machine learning caloric and macronutrient regression models.
    """
    np.random.seed(42)
    random.seed(42)
    
    genders = ["male", "female"]
    goals = ["weight_loss", "muscle_gain", "maintenance", "endurance"]
    activity_levels = ["sedentary", "light", "moderate", "active", "very_active"]
    diet_prefs = ["vegetarian", "non_vegetarian", "vegan", "keto"]
    
    data = []
    for _ in range(num_samples):
        gender = random.choice(genders)
        age = int(np.random.normal(30, 10))
        age = max(18, min(70, age))
        
        if gender == "male":
            height = float(np.random.normal(176, 8))
            weight = float(np.random.normal(78, 14))
            bmr = (10.0 * weight) + (6.25 * height) - (5.0 * age) + 5.0
        else:
            height = float(np.random.normal(163, 7))
            weight = float(np.random.normal(64, 12))
            bmr = (10.0 * weight) + (6.25 * height) - (5.0 * age) - 161.0
            
        height = round(max(140.0, min(210.0, height)), 1)
        weight = round(max(40.0, min(140.0, weight)), 1)
        
        goal = random.choice(goals)
        activity = random.choice(activity_levels)
        diet_pref = random.choice(diet_prefs)
        
        act_mult = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very_active": 1.9
        }[activity]
        
        tdee = bmr * act_mult
        
        # Target calories with slight real-world metabolic noise
        metabolic_variance = np.random.normal(1.0, 0.03)
        if goal == "weight_loss":
            target_calories = (tdee - 500.0) * metabolic_variance
            target_weight = round(weight - random.uniform(3.0, 15.0), 1)
        elif goal == "muscle_gain":
            target_calories = (tdee + 350.0) * metabolic_variance
            target_weight = round(weight + random.uniform(3.0, 10.0), 1)
        elif goal == "endurance":
            target_calories = (tdee + 200.0) * metabolic_variance
            target_weight = round(weight + random.uniform(-2.0, 2.0), 1)
        else:
            target_calories = tdee * metabolic_variance
            target_weight = weight
            
        target_calories = round(max(1200.0, target_calories), 1)
        
        # Target protein, carbs, fat
        if diet_pref == "keto":
            target_protein = round((target_calories * 0.25) / 4.0, 1)
            target_fat = round((target_calories * 0.70) / 9.0, 1)
            target_carbs = round((target_calories * 0.05) / 4.0, 1)
        elif goal == "muscle_gain" or goal == "weight_loss":
            target_protein = round(weight * random.uniform(2.0, 2.3), 1)
            target_fat = round((target_calories * 0.25) / 9.0, 1)
            rem_cals = target_calories - (target_protein * 4) - (target_fat * 9)
            target_carbs = round(max(40.0, rem_cals / 4.0), 1)
        else:
            target_protein = round(weight * random.uniform(1.6, 1.9), 1)
            target_fat = round((target_calories * 0.28) / 9.0, 1)
            rem_cals = target_calories - (target_protein * 4) - (target_fat * 9)
            target_carbs = round(max(50.0, rem_cals / 4.0), 1)
            
        sleep_hours = round(random.uniform(5.5, 9.0), 1)
        stress_score = random.randint(1, 10)
        workout_freq = random.randint(1, 6)
        
        data.append({
            "age": age,
            "gender": gender,
            "height_cm": height,
            "weight_kg": weight,
            "target_weight_kg": target_weight,
            "goal": goal,
            "activity_level": activity,
            "dietary_preference": diet_pref,
            "sleep_hours": sleep_hours,
            "stress_score": stress_score,
            "workout_freq": workout_freq,
            "bmr": round(bmr, 1),
            "tdee": round(tdee, 1),
            "target_calories": target_calories,
            "target_protein": target_protein,
            "target_carbs": target_carbs,
            "target_fat": target_fat
        })
        
    df = pd.DataFrame(data)
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
    return df

if __name__ == "__main__":
    df = generate_synthetic_user_nutrition_dataset(3000, "./app/ml/data/user_nutrition_dataset.csv")
    print(f"Generated {len(df)} records. Sample:\n", df.head(3))
