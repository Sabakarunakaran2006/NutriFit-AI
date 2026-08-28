import collections
from typing import Dict, List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import User, MealPlan, MealPlanItem, FoodItem
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/grocery", tags=["Grocery List"])

CATEGORY_MAPPING = {
    "protein": "Proteins & Meats",
    "grains": "Grains & Carbohydrates",
    "vegetables": "Fresh Vegetables & Greens",
    "fruits": "Fresh Fruits",
    "dairy": "Dairy & Alternatives",
    "healthy_fats": "Healthy Fats & Nuts",
    "snacks": "Snacks & Condiments"
}

@router.get("/")
def get_grocery_list(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Aggregates ingredients from user's current meal plans into a categorized weekly shopping list.
    """
    plans = db.query(MealPlan).filter(
        MealPlan.user_id == current_user.id
    ).order_by(MealPlan.plan_date.desc()).limit(days).all()
    
    grouped_items: Dict[str, List[Dict[str, Any]]] = collections.defaultdict(list)
    aggregated_totals = collections.defaultdict(lambda: {"amount": 0.0, "unit": "g", "category": "Proteins & Meats", "item_name": ""})
    
    for plan in plans:
        for item in plan.items:
            food = item.food_item
            cat_key = food.category if food else "protein"
            group_title = CATEGORY_MAPPING.get(cat_key, "Other Items")
            
            key = item.custom_name
            aggregated_totals[key]["amount"] += item.serving_amount
            aggregated_totals[key]["unit"] = item.serving_unit
            aggregated_totals[key]["category"] = group_title
            aggregated_totals[key]["item_name"] = item.custom_name
            
    # If no plans exist yet, return sample curated starter list
    if not aggregated_totals:
        default_starter = [
            {"item_name": "Grilled Chicken Breast", "amount": 1000.0, "unit": "g", "category": "Proteins & Meats"},
            {"item_name": "Whole Large Eggs", "amount": 12.0, "unit": "count", "category": "Proteins & Meats"},
            {"item_name": "Cooked Brown Rice", "amount": 800.0, "unit": "g", "category": "Grains & Carbohydrates"},
            {"item_name": "Rolled Oatmeal", "amount": 500.0, "unit": "g", "category": "Grains & Carbohydrates"},
            {"item_name": "Fresh Baby Spinach", "amount": 300.0, "unit": "g", "category": "Fresh Vegetables & Greens"},
            {"item_name": "Steamed Broccoli Florets", "amount": 400.0, "unit": "g", "category": "Fresh Vegetables & Greens"},
            {"item_name": "Fresh Blueberries", "amount": 250.0, "unit": "g", "category": "Fresh Fruits"},
            {"item_name": "Fresh Avocado", "amount": 4.0, "unit": "count", "category": "Healthy Fats & Nuts"},
            {"item_name": "Greek Yogurt", "amount": 500.0, "unit": "g", "category": "Dairy & Alternatives"}
        ]
        for itm in default_starter:
            grouped_items[itm["category"]].append({
                "name": itm["item_name"],
                "quantity": itm["amount"],
                "unit": itm["unit"],
                "checked": False
            })
    else:
        for itm in aggregated_totals.values():
            grouped_items[itm["category"]].append({
                "name": itm["item_name"],
                "quantity": round(itm["amount"], 1),
                "unit": itm["unit"],
                "checked": False
            })
            
    return {
        "days_covered": len(plans) if plans else 7,
        "total_items": sum(len(v) for v in grouped_items.values()),
        "categories": [
            {"category_name": cat, "items": items}
            for cat, items in grouped_items.items()
        ]
    }
