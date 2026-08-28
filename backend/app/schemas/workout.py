from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class WorkoutExerciseBase(BaseModel):
    exercise_name: str
    category: str = "Strength"
    target_muscle: str = "Full Body"
    sets: int = 3
    reps: str = "10-12"
    duration_sec: int = 0
    rest_sec: int = 60
    notes: Optional[str] = ""

class WorkoutPlanExerciseOut(WorkoutExerciseBase):
    id: int
    day_name: str
    completed: bool = False

    class Config:
        from_attributes = True

class WorkoutPlanOut(BaseModel):
    id: int
    user_id: int
    archetype: str
    name: str
    week_start_date: str
    status: str
    ai_notes: str
    created_at: datetime
    exercises: List[WorkoutPlanExerciseOut] = []

    class Config:
        from_attributes = True

class WorkoutExerciseToggle(BaseModel):
    exercise_id: int
    completed: bool

class WorkoutLogCreate(BaseModel):
    logged_date: str
    workout_name: str
    duration_mins: int = 45
    calories_burned: float = 300.0
    difficulty_rating: str = "appropriate"  # too_easy, appropriate, too_difficult
    completed: bool = True
    notes: Optional[str] = ""

class WorkoutLogOut(WorkoutLogCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class WorkoutTemplateExerciseOut(WorkoutExerciseBase):
    id: int
    day_of_week: str

    class Config:
        from_attributes = True

class WorkoutTemplateOut(BaseModel):
    id: int
    archetype: str
    name: str
    difficulty: str
    duration_mins: int
    split_type: str
    description: str
    exercises: List[WorkoutTemplateExerciseOut] = []

    class Config:
        from_attributes = True
