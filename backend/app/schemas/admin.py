from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class MLModelInfo(BaseModel):
    id: int
    model_name: str
    algorithm: str
    version: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None
    accuracy: Optional[float] = None
    is_active: bool
    parameters: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ModelRetrainResponse(BaseModel):
    message: str
    models_trained: List[MLModelInfo]
    best_model_name: str
    best_algorithm: str
    metrics: Dict[str, Any]

class SystemOverviewStats(BaseModel):
    total_users: int
    active_users: int
    total_experts: int
    total_meal_plans: int
    total_workout_plans: int
    total_recommendations: int
    avg_system_adherence: float
    total_feedbacks: int

class UserAdminView(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    goal: Optional[str] = "Not set"
    current_weight: Optional[float] = None
    target_weight: Optional[float] = None
    adherence_pct: Optional[float] = 0.0
    assigned_expert: Optional[str] = None

    class Config:
        from_attributes = True

class UserStatusUpdate(BaseModel):
    user_id: int
    is_active: bool

class UserRoleUpdate(BaseModel):
    user_id: int
    role: str  # USER, EXPERT, ADMIN

class ExpertAssignRequest(BaseModel):
    expert_id: int
    user_id: int
    notes: Optional[str] = ""

class DatasetOverview(BaseModel):
    name: str
    record_count: int
    features_count: int
    description: str
    sample_records: List[Dict[str, Any]]
