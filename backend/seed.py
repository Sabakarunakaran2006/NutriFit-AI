import os
import json
import datetime
import sys

# Force UTF-8 stdout if needed
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from sqlalchemy.orm import Session
from app.database.database import SessionLocal, engine, Base
from app.database.models import (
    User, Profile, FoodItem, WorkoutTemplate, WorkoutTemplateExercise,
    MealPlan, MealPlanItem, WorkoutPlan, WorkoutPlanExercise, ProgressLog,
    Feedback, Recommendation, Notification, MLModelRecord, ExpertAssignment
)
from app.core.security import get_password_hash
from app.ml.training.train_calorie_model import train_and_compare_calorie_models
from app.ml.training.train_kmeans_archetype import train_fitness_archetype_clustering
from app.ml.diet_engine import generate_diet_plan

def seed_database():
    print("[*] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    
    try:
        # 1. Train and save ML models
        print("[*] Training ML Caloric Regressors and K-Means Clustering...")
        cal_results = train_and_compare_calorie_models()
        kmeans_results = train_fitness_archetype_clustering()
        
        # 2. Seed Users (Demo User, Demo Expert, Demo Admin)
        print("[*] Seeding demo user accounts...")
        admin_user = db.query(User).filter(User.email == "admin@demo.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@demo.com",
                hashed_password=get_password_hash("Admin@123"),
                full_name="System Administrator",
                role="ADMIN",
                is_active=True
            )
            db.add(admin_user)
            
        expert_user = db.query(User).filter(User.email == "expert@demo.com").first()
        if not expert_user:
            expert_user = User(
                email="expert@demo.com",
                hashed_password=get_password_hash("Expert@123"),
                full_name="Dr. Sarah Jenkins (RD, CSCS)",
                role="EXPERT",
                is_active=True
            )
            db.add(expert_user)
            
        demo_user = db.query(User).filter(User.email == "user@demo.com").first()
        if not demo_user:
            demo_user = User(
                email="user@demo.com",
                hashed_password=get_password_hash("User@123"),
                full_name="Alex Rivera",
                role="USER",
                is_active=True
            )
            db.add(demo_user)
            
        db.commit()
        db.refresh(admin_user)
        db.refresh(expert_user)
        db.refresh(demo_user)
        
        # 3. Seed Food Items
        print("[*] Seeding nutritional food items...")
        food_file = os.path.join(os.path.dirname(__file__), "app/ml/data/food_dataset.json")
        if os.path.exists(food_file):
            with open(food_file, "r", encoding="utf-8") as f:
                foods_data = json.load(f)
            for item in foods_data:
                existing_food = db.query(FoodItem).filter(FoodItem.name == item["name"]).first()
                if not existing_food:
                    f_obj = FoodItem(
                        name=item["name"],
                        category=item["category"],
                        calories=item["calories"],
                        protein_g=item["protein_g"],
                        carbs_g=item["carbs_g"],
                        fat_g=item["fat_g"],
                        fiber_g=item.get("fiber_g", 0.0),
                        serving_size=item.get("serving_size", 100.0),
                        serving_unit=item.get("serving_unit", "g"),
                        dietary_tags=item.get("dietary_tags", "non_vegetarian"),
                        allergen_tags=item.get("allergen_tags", ""),
                        image_url=item.get("image_url", None)
                    )
                    db.add(f_obj)
            db.commit()

        # 4. Seed Workout Templates
        print("[*] Seeding workout templates and archetype routines...")
        workout_file = os.path.join(os.path.dirname(__file__), "app/ml/data/workout_dataset.json")
        if os.path.exists(workout_file):
            with open(workout_file, "r", encoding="utf-8") as f:
                workout_templates_data = json.load(f)
            for t_data in workout_templates_data:
                existing_t = db.query(WorkoutTemplate).filter(WorkoutTemplate.archetype == t_data["archetype"]).first()
                if not existing_t:
                    tmpl = WorkoutTemplate(
                        archetype=t_data["archetype"],
                        name=t_data["name"],
                        difficulty=t_data["difficulty"],
                        duration_mins=t_data["duration_mins"],
                        split_type=t_data["split_type"],
                        description=t_data["description"]
                    )
                    db.add(tmpl)
                    db.flush()
                    for ex in t_data.get("exercises", []):
                        w_ex = WorkoutTemplateExercise(
                            template_id=tmpl.id,
                            day_of_week=ex["day_of_week"],
                            exercise_name=ex["exercise_name"],
                            category=ex.get("category", "Compound"),
                            target_muscle=ex.get("target_muscle", "Full Body"),
                            sets=ex.get("sets", 3),
                            reps=str(ex.get("reps", "10-12")),
                            duration_sec=ex.get("duration_sec", 0),
                            rest_sec=ex.get("rest_sec", 60),
                            notes=ex.get("notes", "")
                        )
                        db.add(w_ex)
            db.commit()

        # 5. Seed Demo User Profile
        print("[*] Setting up Demo User profile and personalized recommendations...")
        profile = db.query(Profile).filter(Profile.user_id == demo_user.id).first()
        if not profile:
            profile = Profile(
                user_id=demo_user.id,
                age=24,
                gender="male",
                height_cm=178.0,
                weight_kg=72.0,
                target_weight_kg=76.0,
                goal="muscle_gain",
                activity_level="moderate",
                dietary_preference="non_vegetarian",
                allergies=json.dumps([]),
                health_conditions=json.dumps([]),
                sleep_hours=7.5,
                stress_level="moderate",
                meal_frequency=4,
                bmr=1717.5,
                tdee=2662.1,
                target_calories=2450.0,
                target_protein=155.0,
                target_carbs=280.0,
                target_fat=68.0,
                water_goal_liters=3.1,
                fitness_archetype="Lean Muscle Gain",
                ml_caloric_adjustment=0.0
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

        # Assign Demo User to Demo Expert
        assign = db.query(ExpertAssignment).filter(ExpertAssignment.user_id == demo_user.id).first()
        if not assign:
            assign = ExpertAssignment(expert_id=expert_user.id, user_id=demo_user.id, notes="Client on hyper-growth muscle hypertrophy protocol.")
            db.add(assign)
            db.commit()

        # 6. Generate Today's Diet Plan for Demo User
        today_str = datetime.date.today().isoformat()
        existing_plan = db.query(MealPlan).filter(MealPlan.user_id == demo_user.id, MealPlan.plan_date == today_str).first()
        if not existing_plan:
            generate_diet_plan(
                db=db,
                user_id=demo_user.id,
                plan_date=today_str,
                target_calories=profile.target_calories,
                target_protein=profile.target_protein,
                target_carbs=profile.target_carbs,
                target_fat=profile.target_fat,
                goal=profile.goal,
                dietary_pref=profile.dietary_preference,
                allergies=[]
            )

        # 7. Generate Active Workout Plan for Demo User
        existing_wp = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == demo_user.id, WorkoutPlan.status == "active").first()
        if not existing_wp:
            template = db.query(WorkoutTemplate).filter(WorkoutTemplate.archetype == "Lean Muscle Gain").first()
            wp = WorkoutPlan(
                user_id=demo_user.id,
                archetype="Lean Muscle Gain",
                name=template.name if template else "Hypertrophy PPL Routine",
                week_start_date=today_str,
                status="active",
                ai_notes="Dynamic resistance protocol calibrated for 1.8-2.2g/kg protein intake and progressive overload."
            )
            db.add(wp)
            db.flush()
            if template:
                for ex in template.exercises:
                    plan_ex = WorkoutPlanExercise(
                        workout_plan_id=wp.id,
                        day_name=ex.day_of_week,
                        exercise_name=ex.exercise_name,
                        category=ex.category,
                        target_muscle=ex.target_muscle,
                        sets=ex.sets,
                        reps=ex.reps,
                        duration_sec=ex.duration_sec,
                        rest_sec=ex.rest_sec,
                        completed=False,
                        notes=ex.notes
                    )
                    db.add(plan_ex)
            db.commit()

        # 8. Seed 14 Days of Progress Logs
        print("[*] Seeding historical progress logs and adherence data...")
        for i in range(14, 0, -1):
            d = (datetime.date.today() - datetime.timedelta(days=i)).isoformat()
            existing_log = db.query(ProgressLog).filter(ProgressLog.user_id == demo_user.id, ProgressLog.logged_date == d).first()
            if not existing_log:
                log = ProgressLog(
                    user_id=demo_user.id,
                    logged_date=d,
                    weight_kg=round(71.0 + ((14 - i) * 0.08), 2),
                    calories_consumed=round(2400.0 + ((i % 3) * 50), 0),
                    protein_consumed=round(150.0 + ((i % 4) * 5), 0),
                    water_liters=3.0,
                    sleep_hours=7.5,
                    energy_level=8 if i % 2 == 0 else 7,
                    adherence_pct=round(88.0 - ((i % 5) * 2), 1),
                    notes="Felt energized, great workout intensity."
                )
                db.add(log)
        db.commit()

        # 9. Seed Sample Feedbacks & Recommendations
        existing_fb = db.query(Feedback).filter(Feedback.user_id == demo_user.id).first()
        if not existing_fb:
            fb = Feedback(
                user_id=demo_user.id,
                logged_date=(datetime.date.today() - datetime.timedelta(days=1)).isoformat(),
                diet_rating=5,
                workout_rating=4,
                workout_difficulty="appropriate",
                followed_diet=True,
                energy_level=8,
                hunger_level=4,
                comments="High energy throughout the session. Loving the high protein meals!",
                processed=True,
                ai_response="Excellent adherence! Metabolic balance maintained for steady lean tissue synthesis."
            )
            db.add(fb)
            
            rec1 = Recommendation(
                user_id=demo_user.id,
                rec_type="diet",
                title="Optimal Post-Workout Protein Synthesis",
                message="Consume 30-40g fast-digesting protein within 60 minutes of finishing your Push session.",
                reason="High protein recommendation because your primary goal is lean muscle hypertrophy.",
                impact_calories=0.0,
                impact_protein=35.0,
                status="active"
            )
            rec2 = Recommendation(
                user_id=demo_user.id,
                rec_type="workout",
                title="Progressive Overload Trigger",
                message="Target 8-10 reps on Incline Bench Press; if you complete 10 reps on all sets, add 2.5kg next week.",
                reason="Your workout completion rate is 92%, indicating readiness for progressive resistance increase.",
                impact_calories=0.0,
                impact_protein=0.0,
                status="active"
            )
            db.add_all([rec1, rec2])
            db.commit()

        # 10. Seed ML Models in Registry
        print("[*] Registering ML models in database...")
        for alg_name, metrics in cal_results["results"].items():
            existing_m = db.query(MLModelRecord).filter(MLModelRecord.model_name == f"Calorie {alg_name}").first()
            if not existing_m:
                m_rec = MLModelRecord(
                    model_name=f"Calorie {alg_name}",
                    algorithm=alg_name.replace(" ", ""),
                    version="v1.0.0",
                    mae=metrics["mae"],
                    rmse=metrics["rmse"],
                    r2=metrics["r2"],
                    is_active=(alg_name == cal_results["best_model_name"]),
                    parameters_json=json.dumps({"features": ["age", "height_cm", "weight_kg", "goal", "activity_level", "dietary_preference", "sleep_hours", "stress_score"]})
                )
                db.add(m_rec)
        db.commit()

        print("[OK] Database successfully seeded! All models, demo users, and templates are ready.")
        
    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
