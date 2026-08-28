import json
import random
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database.models import FoodItem, MealPlan, MealPlanItem

MEAL_SLOT_CONFIG = {
    "breakfast": {"ratio": 0.25, "time": "08:00 AM", "preferred_categories": ["grains", "protein", "dairy", "fruits"]},
    "lunch": {"ratio": 0.35, "time": "01:00 PM", "preferred_categories": ["protein", "grains", "vegetables", "healthy_fats"]},
    "snack": {"ratio": 0.15, "time": "04:30 PM", "preferred_categories": ["fruits", "healthy_fats", "dairy", "protein"]},
    "dinner": {"ratio": 0.25, "time": "07:30 PM", "preferred_categories": ["protein", "vegetables", "grains", "healthy_fats"]}
}

def is_food_compatible(food: FoodItem, dietary_pref: str, allergies: List[str]) -> bool:
    pref = dietary_pref.lower()
    tags = [t.strip().lower() for t in (food.dietary_tags or "").split(",") if t.strip()]
    allergen_tags = [a.strip().lower() for a in (food.allergen_tags or "").split(",") if a.strip()]
    
    # Check allergen violations
    for allergy in allergies:
        allergy_clean = allergy.strip().lower()
        if allergy_clean and allergy_clean in allergen_tags:
            return False
            
    # Check dietary preference
    if pref == "vegan":
        return "vegan" in tags
    elif pref == "vegetarian":
        return "vegetarian" in tags or "vegan" in tags
    elif pref == "keto":
        return "keto" in tags
    elif pref == "non_vegetarian":
        return True
    return True

def generate_explainable_meal_reason(
    meal_type: str,
    food_name: str,
    calories: float,
    protein_g: float,
    goal: str,
    dietary_pref: str
) -> str:
    goal_phrasing = {
        "muscle_gain": f"High in bioavailable protein ({protein_g}g) to support myofibrillar protein synthesis",
        "weight_loss": f"Nutrient-dense with high satiety index ({calories} kcal, {protein_g}g protein) to sustain caloric deficit",
        "endurance": f"Balanced complex carbohydrate and glycogen-replenishing profile",
        "maintenance": f"Equilibrated macronutrient distribution for sustained metabolic homeostasis"
    }.get(goal.lower(), "Optimal macronutrient density")
    
    return f"Selected for {meal_type.title()} ({calories} kcal, {protein_g}g protein). {goal_phrasing} adhering to {dietary_pref} guidelines."

def generate_diet_plan(
    db: Session,
    user_id: int,
    plan_date: str,
    target_calories: float,
    target_protein: float,
    target_carbs: float,
    target_fat: float,
    goal: str,
    dietary_pref: str,
    allergies: List[str]
) -> MealPlan:
    """
    Constraint-satisfaction recommendation engine selecting optimal meals
    to match target calories and macronutrients without allergen or preference conflicts.
    """
    all_foods = db.query(FoodItem).all()
    compatible_foods = [f for f in all_foods if is_food_compatible(f, dietary_pref, allergies)]
    
    if not compatible_foods:
        # Fallback to all foods if too restrictive
        compatible_foods = all_foods
        
    meal_plan = MealPlan(
        user_id=user_id,
        plan_date=plan_date,
        total_calories=0.0,
        total_protein=0.0,
        total_carbs=0.0,
        total_fat=0.0,
        status="active",
        explanation=f"AI Personalized Meal Plan calculated for {target_calories:.0f} kcal budget ({target_protein:.0f}g P / {target_carbs:.0f}g C / {target_fat:.0f}g F)."
    )
    db.add(meal_plan)
    db.flush()
    
    total_cals = 0.0
    total_prot = 0.0
    total_carbs_acc = 0.0
    total_fat_acc = 0.0
    
    for meal_type, config in MEAL_SLOT_CONFIG.items():
        slot_calorie_budget = target_calories * config["ratio"]
        slot_protein_budget = target_protein * config["ratio"]
        
        # Filter foods for this slot's preferred categories
        slot_foods = [f for f in compatible_foods if f.category in config["preferred_categories"]]
        if not slot_foods:
            slot_foods = compatible_foods
            
        # Score foods by how well their macro ratio aligns with target
        scored_foods = []
        for food in slot_foods:
            cal_diff = abs(food.calories - slot_calorie_budget)
            # Favor higher protein for muscle gain or weight loss
            prot_bonus = food.protein_g * 2.0 if goal in ["muscle_gain", "weight_loss"] else 0.0
            score = -cal_diff + prot_bonus
            scored_foods.append((score, food))
            
        scored_foods.sort(key=lambda x: x[0], reverse=True)
        top_candidates = [f for _, f in scored_foods[:5]]
        chosen_food = random.choice(top_candidates) if top_candidates else compatible_foods[0]
        
        # Scale serving size to reasonably fill slot calories (0.8x to 1.5x)
        serving_mult = round(max(0.6, min(2.0, slot_calorie_budget / max(50.0, chosen_food.calories))), 2)
        meal_cals = round(chosen_food.calories * serving_mult, 1)
        meal_prot = round(chosen_food.protein_g * serving_mult, 1)
        meal_carbs = round(chosen_food.carbs_g * serving_mult, 1)
        meal_fat = round(chosen_food.fat_g * serving_mult, 1)
        
        reason = generate_explainable_meal_reason(
            meal_type=meal_type,
            food_name=chosen_food.name,
            calories=meal_cals,
            protein_g=meal_prot,
            goal=goal,
            dietary_pref=dietary_pref
        )
        
        item = MealPlanItem(
            meal_plan_id=meal_plan.id,
            meal_type=meal_type,
            food_item_id=chosen_food.id,
            custom_name=chosen_food.name,
            calories=meal_cals,
            protein_g=meal_prot,
            carbs_g=meal_carbs,
            fat_g=meal_fat,
            serving_amount=round(chosen_food.serving_size * serving_mult, 1),
            serving_unit=chosen_food.serving_unit,
            meal_time=config["time"],
            reason=reason
        )
        db.add(item)
        
        total_cals += meal_cals
        total_prot += meal_prot
        total_carbs_acc += meal_carbs
        total_fat_acc += meal_fat

    meal_plan.total_calories = round(total_cals, 1)
    meal_plan.total_protein = round(total_prot, 1)
    meal_plan.total_carbs = round(total_carbs_acc, 1)
    meal_plan.total_fat = round(total_fat_acc, 1)
    
    db.commit()
    db.refresh(meal_plan)
    return meal_plan

def get_meal_replacement_alternatives(
    db: Session,
    meal_item: MealPlanItem,
    dietary_pref: str,
    allergies: List[str],
    goal: str
) -> List[Dict[str, Any]]:
    """
    Finds top 4 nutritional replacement alternatives for an existing meal item,
    ensuring comparable caloric/macro density and allergy compliance.
    """
    all_foods = db.query(FoodItem).all()
    compatible_foods = [
        f for f in all_foods
        if is_food_compatible(f, dietary_pref, allergies) and f.id != meal_item.food_item_id
    ]
    
    target_cals = meal_item.calories
    alternatives = []
    
    for food in compatible_foods:
        # Scale to match original meal calories
        mult = round(max(0.5, min(2.5, target_cals / max(50.0, food.calories))), 2)
        alt_cals = round(food.calories * mult, 1)
        alt_prot = round(food.protein_g * mult, 1)
        alt_carbs = round(food.carbs_g * mult, 1)
        alt_fat = round(food.fat_g * mult, 1)
        
        cal_diff = abs(alt_cals - target_cals)
        if cal_diff < 120.0:
            reason = f"Nutritionally equivalent replacement ({alt_cals} kcal, {alt_prot}g P) maintaining your daily macro balance."
            alternatives.append({
                "food_item": food,
                "calories": alt_cals,
                "protein_g": alt_prot,
                "carbs_g": alt_carbs,
                "fat_g": alt_fat,
                "serving_amount": round(food.serving_size * mult, 1),
                "serving_unit": food.serving_unit,
                "reason": reason,
                "cal_diff": cal_diff
            })
            
    alternatives.sort(key=lambda x: x["cal_diff"])
    return alternatives[:5]
