import pytest
from app.services.nutrition_calculator import calculate_bmr, calculate_tdee, calculate_nutrition_targets

def test_bmr_male_calculation():
    # Male: 70kg, 175cm, 25yr
    # (10 * 70) + (6.25 * 175) - (5 * 25) + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1673.8
    bmr = calculate_bmr(70.0, 175.0, 25, "male")
    assert round(bmr, 0) == 1674.0

def test_bmr_female_calculation():
    # Female: 60kg, 165cm, 30yr
    # (10 * 60) + (6.25 * 165) - (5 * 30) - 161 = 600 + 1031.25 - 150 - 161 = 1320.25 -> 1320.2
    bmr = calculate_bmr(60.0, 165.0, 30, "female")
    assert round(bmr, 0) == 1320.0

def test_tdee_calculation():
    bmr = 1600.0
    tdee_sed = calculate_tdee(bmr, "sedentary")
    tdee_mod = calculate_tdee(bmr, "moderate")
    assert tdee_sed == 1600.0 * 1.2
    assert tdee_mod == 1600.0 * 1.55

def test_muscle_gain_targets():
    targets = calculate_nutrition_targets(
        age=24,
        gender="male",
        height_cm=180.0,
        weight_kg=75.0,
        target_weight_kg=80.0,
        goal="muscle_gain",
        activity_level="moderate"
    )
    assert targets["target_calories"] > targets["tdee"]
    assert targets["target_protein"] >= 150.0  # At least 2.0g/kg
    assert targets["water_goal_liters"] >= 2.5
    assert targets["fitness_archetype"] == "Lean Muscle Gain"

def test_weight_loss_targets_safety_floor():
    targets = calculate_nutrition_targets(
        age=30,
        gender="female",
        height_cm=150.0,
        weight_kg=45.0,
        target_weight_kg=42.0,
        goal="weight_loss",
        activity_level="sedentary"
    )
    # Ensure safe calorie floor for females (>= 1200 kcal)
    assert targets["target_calories"] >= 1200.0

def test_keto_macro_distribution():
    targets = calculate_nutrition_targets(
        age=28,
        gender="male",
        height_cm=175.0,
        weight_kg=80.0,
        target_weight_kg=75.0,
        goal="weight_loss",
        activity_level="moderate",
        dietary_preference="keto"
    )
    fat_cals = targets["target_fat"] * 9.0
    carb_cals = targets["target_carbs"] * 4.0
    # Keto fat should be >= 60% of total calories
    assert (fat_cals / targets["target_calories"]) >= 0.60
    # Keto carbs should be <= 10% of total calories
    assert (carb_cals / targets["target_calories"]) <= 0.10
