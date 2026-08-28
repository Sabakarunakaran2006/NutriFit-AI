import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.database.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="USER", nullable=False)  # USER, EXPERT, ADMIN
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    meal_plans = relationship("MealPlan", back_populates="user", cascade="all, delete-orphan")
    workout_plans = relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")
    meal_logs = relationship("MealLog", back_populates="user", cascade="all, delete-orphan")
    workout_logs = relationship("WorkoutLog", back_populates="user", cascade="all, delete-orphan")
    progress_logs = relationship("ProgressLog", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    assigned_expert = relationship("ExpertAssignment", back_populates="user", foreign_keys="ExpertAssignment.user_id", uselist=False)
    expert_clients = relationship("ExpertAssignment", back_populates="expert", foreign_keys="ExpertAssignment.expert_id")


class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    age = Column(Integer, nullable=False, default=25)
    gender = Column(String(20), nullable=False, default="male")  # male, female, other
    height_cm = Column(Float, nullable=False, default=175.0)
    weight_kg = Column(Float, nullable=False, default=70.0)
    target_weight_kg = Column(Float, nullable=False, default=65.0)
    
    goal = Column(String(50), nullable=False, default="muscle_gain")  # weight_loss, muscle_gain, maintenance, endurance
    activity_level = Column(String(50), nullable=False, default="moderate")  # sedentary, light, moderate, active, very_active
    dietary_preference = Column(String(50), nullable=False, default="non_vegetarian")  # vegetarian, non_vegetarian, vegan, keto, other
    allergies = Column(Text, default="[]")  # JSON string array: ["nuts", "dairy", "gluten", etc.]
    health_conditions = Column(Text, default="[]")  # JSON string array: ["diabetes", "hypertension", etc.]
    
    sleep_hours = Column(Float, default=7.5)
    stress_level = Column(String(50), default="moderate")  # low, moderate, high
    meal_frequency = Column(Integer, default=4)  # 3, 4, 5 meals per day
    
    # Calculated baseline & ML metrics
    bmr = Column(Float, default=1650.0)
    tdee = Column(Float, default=2250.0)
    target_calories = Column(Float, default=2200.0)
    target_protein = Column(Float, default=130.0)  # grams
    target_carbs = Column(Float, default=250.0)    # grams
    target_fat = Column(Float, default=70.0)       # grams
    water_goal_liters = Column(Float, default=3.0)
    
    fitness_archetype = Column(String(100), default="Lean Muscle Gain")
    ml_caloric_adjustment = Column(Float, default=0.0)  # Adaptive offset from baseline
    
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="profile")


class FoodItem(Base):
    __tablename__ = "food_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # protein, grains, vegetables, fruits, dairy, healthy_fats, snacks
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbs_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)
    fiber_g = Column(Float, default=0.0)
    serving_size = Column(Float, nullable=False, default=100.0)
    serving_unit = Column(String(50), nullable=False, default="g")  # g, ml, piece, cup, slice
    dietary_tags = Column(String(255), default="non_vegetarian")  # comma-separated: vegetarian,vegan,keto,gluten_free,etc.
    allergen_tags = Column(String(255), default="")  # comma-separated: dairy,nuts,gluten,eggs,shellfish,soy
    image_url = Column(String(500), nullable=True)


class MealPlan(Base):
    __tablename__ = "meal_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    total_calories = Column(Float, default=0.0)
    total_protein = Column(Float, default=0.0)
    total_carbs = Column(Float, default=0.0)
    total_fat = Column(Float, default=0.0)
    status = Column(String(50), default="active")  # active, completed, archived
    explanation = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="meal_plans")
    items = relationship("MealPlanItem", back_populates="meal_plan", cascade="all, delete-orphan")


class MealPlanItem(Base):
    __tablename__ = "meal_plan_items"
    
    id = Column(Integer, primary_key=True, index=True)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False)
    meal_type = Column(String(50), nullable=False)  # breakfast, lunch, snack, dinner
    food_item_id = Column(Integer, ForeignKey("food_items.id"), nullable=True)
    custom_name = Column(String(255), nullable=False)
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbs_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)
    serving_amount = Column(Float, default=1.0)
    serving_unit = Column(String(50), default="serving")
    meal_time = Column(String(20), default="08:00 AM")
    reason = Column(Text, default="")
    
    meal_plan = relationship("MealPlan", back_populates="items")
    food_item = relationship("FoodItem")


class WorkoutTemplate(Base):
    __tablename__ = "workout_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    archetype = Column(String(100), nullable=False, index=True)  # Beginner, Fat Loss, Strength, Muscle Gain, Endurance
    name = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="intermediate")  # beginner, intermediate, advanced
    duration_mins = Column(Integer, default=45)
    split_type = Column(String(100), default="Full Body")
    description = Column(Text, default="")
    
    exercises = relationship("WorkoutTemplateExercise", back_populates="template", cascade="all, delete-orphan")


class WorkoutTemplateExercise(Base):
    __tablename__ = "workout_template_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workout_templates.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(String(20), nullable=False)  # Monday, Tuesday, etc.
    exercise_name = Column(String(255), nullable=False)
    category = Column(String(100), default="Compound")  # Compound, Isolation, Cardio, Mobility
    target_muscle = Column(String(100), default="Full Body")
    sets = Column(Integer, default=3)
    reps = Column(String(50), default="10-12")
    duration_sec = Column(Integer, default=0)
    rest_sec = Column(Integer, default=60)
    notes = Column(Text, default="")
    
    template = relationship("WorkoutTemplate", back_populates="exercises")


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    archetype = Column(String(100), default="Lean Muscle Gain")
    name = Column(String(255), nullable=False)
    week_start_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    status = Column(String(50), default="active")  # active, completed, archived
    ai_notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="workout_plans")
    exercises = relationship("WorkoutPlanExercise", back_populates="workout_plan", cascade="all, delete-orphan")


class WorkoutPlanExercise(Base):
    __tablename__ = "workout_plan_exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    workout_plan_id = Column(Integer, ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False)
    day_name = Column(String(20), nullable=False)  # Monday, Tuesday, etc.
    exercise_name = Column(String(255), nullable=False)
    category = Column(String(100), default="Strength")
    target_muscle = Column(String(100), default="Chest")
    sets = Column(Integer, default=3)
    reps = Column(String(50), default="10-12")
    duration_sec = Column(Integer, default=0)
    rest_sec = Column(Integer, default=60)
    completed = Column(Boolean, default=False)
    notes = Column(Text, default="")
    
    workout_plan = relationship("WorkoutPlan", back_populates="exercises")


class MealLog(Base):
    __tablename__ = "meal_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    logged_date = Column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    meal_type = Column(String(50), nullable=False)  # breakfast, lunch, snack, dinner
    food_item_id = Column(Integer, ForeignKey("food_items.id"), nullable=True)
    food_name = Column(String(255), nullable=False)
    calories = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbs_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)
    serving_size = Column(Float, default=1.0)
    serving_unit = Column(String(50), default="serving")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="meal_logs")


class WorkoutLog(Base):
    __tablename__ = "workout_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    logged_date = Column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    workout_name = Column(String(255), nullable=False)
    duration_mins = Column(Integer, default=45)
    calories_burned = Column(Float, default=300.0)
    difficulty_rating = Column(String(50), default="appropriate")  # too_easy, appropriate, too_difficult
    completed = Column(Boolean, default=True)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="workout_logs")


class ProgressLog(Base):
    __tablename__ = "progress_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    logged_date = Column(String(20), nullable=False, index=True)  # YYYY-MM-DD
    weight_kg = Column(Float, nullable=False)
    calories_consumed = Column(Float, default=0.0)
    protein_consumed = Column(Float, default=0.0)
    water_liters = Column(Float, default=2.5)
    sleep_hours = Column(Float, default=7.0)
    energy_level = Column(Integer, default=7)  # 1-10
    adherence_pct = Column(Float, default=80.0)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="progress_logs")


class Feedback(Base):
    __tablename__ = "feedbacks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    logged_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    diet_rating = Column(Integer, default=4)  # 1-5
    workout_rating = Column(Integer, default=4)  # 1-5
    workout_difficulty = Column(String(50), default="appropriate")  # too_easy, appropriate, too_difficult
    followed_diet = Column(Boolean, default=True)
    energy_level = Column(Integer, default=7)  # 1-10
    hunger_level = Column(Integer, default=5)  # 1-10 (1: full, 10: starving)
    comments = Column(Text, default="")
    processed = Column(Boolean, default=False)
    ai_response = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="feedbacks")


class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rec_type = Column(String(50), nullable=False)  # diet, workout, general, adaptive
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    impact_calories = Column(Float, default=0.0)
    impact_protein = Column(Float, default=0.0)
    status = Column(String(50), default="active")  # active, applied, dismissed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="recommendations")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # info, success, warning, alert
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")


class MLModelRecord(Base):
    __tablename__ = "ml_models"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False, unique=True)
    algorithm = Column(String(100), nullable=False)  # Random Forest, Gradient Boosting, Linear Regression, K-Means
    version = Column(String(50), default="v1.0.0")
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    r2 = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    parameters_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class ExpertAssignment(Base):
    __tablename__ = "expert_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    expert_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    notes = Column(Text, default="")
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    expert = relationship("User", foreign_keys=[expert_id], back_populates="expert_clients")
    user = relationship("User", foreign_keys=[user_id], back_populates="assigned_expert")
