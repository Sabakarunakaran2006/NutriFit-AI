from typing import Dict, Any, List

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """
    Mifflin-St Jeor Equation for Basal Metabolic Rate (BMR)
    """
    if gender.lower() == "male":
        bmr = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age) + 5.0
    else:
        # Default to female / general equation
        bmr = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age) - 161.0
    return round(bmr, 1)

def get_activity_multiplier(activity_level: str) -> float:
    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9
    }
    return multipliers.get(activity_level.lower(), 1.55)

def calculate_tdee(bmr: float, activity_level: str) -> float:
    multiplier = get_activity_multiplier(activity_level)
    return round(bmr * multiplier, 1)

def calculate_nutrition_targets(
    age: int,
    gender: str,
    height_cm: float,
    weight_kg: float,
    target_weight_kg: float,
    goal: str,
    activity_level: str,
    dietary_preference: str = "non_vegetarian",
    ml_caloric_offset: float = 0.0
) -> Dict[str, Any]:
    """
    Computes scientific baseline caloric and macronutrient targets,
    enhanced with machine learning adjustments.
    """
    bmr = calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = calculate_tdee(bmr, activity_level)
    
    # Goal adjustments
    goal_lower = goal.lower()
    if goal_lower == "weight_loss":
        # Safe 500 kcal deficit (~0.5kg loss per week)
        calorie_target = tdee - 500.0
        # Floor safe minimums
        min_safe = 1500.0 if gender.lower() == "male" else 1200.0
        calorie_target = max(calorie_target, min_safe)
    elif goal_lower == "muscle_gain":
        # Moderate 350 kcal surplus
        calorie_target = tdee + 350.0
    elif goal_lower == "endurance":
        # Slight surplus for performance energy
        calorie_target = tdee + 200.0
    else:  # maintenance
        calorie_target = tdee

    # Apply ML or adaptive calibration offset
    calorie_target += ml_caloric_offset
    calorie_target = round(calorie_target, 0)
    
    # Macro distributions (Protein, Carbs, Fat)
    pref_lower = dietary_preference.lower()
    
    if pref_lower == "keto":
        # Keto: 70% Fat, 25% Protein, 5% Carbs
        fat_calories = calorie_target * 0.70
        protein_calories = calorie_target * 0.25
        carb_calories = calorie_target * 0.05
        
        target_fat = round(fat_calories / 9.0, 1)
        target_protein = round(protein_calories / 4.0, 1)
        target_carbs = round(carb_calories / 4.0, 1)
    else:
        # Standard evidence-based bodybuilding & sports nutrition guidelines
        if goal_lower == "muscle_gain":
            # 2.0g to 2.2g protein per kg
            target_protein = round(weight_kg * 2.1, 1)
            # 25% calories from healthy fats
            target_fat = round((calorie_target * 0.25) / 9.0, 1)
            # Remainder from carbohydrates
            remaining_cals = calorie_target - (target_protein * 4.0) - (target_fat * 9.0)
            target_carbs = round(max(50.0, remaining_cals / 4.0), 1)
            
        elif goal_lower == "weight_loss":
            # High protein to preserve lean muscle during deficit: 2.2g per kg
            target_protein = round(weight_kg * 2.2, 1)
            target_fat = round((calorie_target * 0.25) / 9.0, 1)
            remaining_cals = calorie_target - (target_protein * 4.0) - (target_fat * 9.0)
            target_carbs = round(max(40.0, remaining_cals / 4.0), 1)
            
        elif goal_lower == "endurance":
            # High carb for glycogen replenishment
            target_protein = round(weight_kg * 1.6, 1)
            target_fat = round((calorie_target * 0.20) / 9.0, 1)
            remaining_cals = calorie_target - (target_protein * 4.0) - (target_fat * 9.0)
            target_carbs = round(max(60.0, remaining_cals / 4.0), 1)
            
        else:  # maintenance
            target_protein = round(weight_kg * 1.8, 1)
            target_fat = round((calorie_target * 0.28) / 9.0, 1)
            remaining_cals = calorie_target - (target_protein * 4.0) - (target_fat * 9.0)
            target_carbs = round(max(50.0, remaining_cals / 4.0), 1)
            
    # Daily Water intake baseline: 35ml per kg + activity bonus
    activity_water_bonus = {
        "sedentary": 0.0,
        "light": 0.3,
        "moderate": 0.6,
        "active": 0.9,
        "very_active": 1.2
    }.get(activity_level.lower(), 0.5)
    
    water_goal_liters = round(min(5.0, max(2.0, (weight_kg * 0.035) + activity_water_bonus)), 1)
    
    # Fitness Archetype estimation
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

    explanation = (
        f"Calculated BMR of {bmr} kcal and TDEE of {tdee} kcal based on Mifflin-St Jeor formula. "
        f"Target calibrated to {calorie_target} kcal for {goal.replace('_', ' ')} with a "
        f"{target_protein}g protein ({round((target_protein*4/calorie_target)*100)}%), "
        f"{target_carbs}g carb ({round((target_carbs*4/calorie_target)*100)}%), and "
        f"{target_fat}g fat ({round((target_fat*9/calorie_target)*100)}%) distribution."
    )

    return {
        "bmr": bmr,
        "tdee": tdee,
        "target_calories": calorie_target,
        "target_protein": target_protein,
        "target_carbs": target_carbs,
        "target_fat": target_fat,
        "water_goal_liters": water_goal_liters,
        "fitness_archetype": archetype,
        "explanation": explanation
    }
