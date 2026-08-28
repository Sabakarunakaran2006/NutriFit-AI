from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProgressLogCreate(BaseModel):
    logged_date: str  # YYYY-MM-DD
    weight_kg: float = Field(..., ge=30.0, le=300.0)
    calories_consumed: Optional[float] = 0.0
    protein_consumed: Optional[float] = 0.0
    water_liters: Optional[float] = 2.5
    sleep_hours: Optional[float] = 7.0
    energy_level: Optional[int] = Field(default=7, ge=1, le=10)
    notes: Optional[str] = ""

class ProgressLogOut(ProgressLogCreate):
    id: int
    user_id: int
    adherence_pct: float
    created_at: datetime

    class Config:
        from_attributes = True

class ProgressTimeSeriesPoint(BaseModel):
    date: str
    weight: float
    target_weight: float
    calories_actual: float
    calories_target: float
    protein_actual: float
    protein_target: float
    water_liters: float
    sleep_hours: float
    adherence_pct: float
    workout_completed: bool

class ProgressSummary(BaseModel):
    current_weight: float
    starting_weight: float
    target_weight: float
    weight_change: float
    avg_calories: float
    avg_protein: float
    avg_water: float
    avg_sleep: float
    avg_adherence: float
    total_workouts_completed: int
    time_series: List[ProgressTimeSeriesPoint] = []
