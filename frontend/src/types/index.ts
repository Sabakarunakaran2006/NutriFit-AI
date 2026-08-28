export type UserRole = 'USER' | 'EXPERT' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
  has_profile: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Profile {
  id: number;
  user_id: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietary_preference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'keto' | 'other';
  allergies: string[];
  health_conditions: string[];
  sleep_hours: number;
  stress_level: 'low' | 'moderate' | 'high';
  meal_frequency: number;
  bmr: number;
  tdee: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  water_goal_liters: number;
  fitness_archetype: string;
  ml_caloric_adjustment: number;
  updated_at: string;
}

export interface FoodItem {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  serving_size: number;
  serving_unit: string;
  dietary_tags: string;
  allergen_tags: string;
  image_url?: string;
}

export interface MealPlanItem {
  id: number;
  meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  food_item_id?: number;
  custom_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_amount: number;
  serving_unit: string;
  meal_time: string;
  reason: string;
  food_item?: FoodItem;
}

export interface MealPlan {
  id: number;
  user_id: number;
  plan_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  status: string;
  explanation: string;
  created_at: string;
  items: MealPlanItem[];
}

export interface MealReplaceAlternative {
  food_item: FoodItem;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  serving_amount: number;
  serving_unit: string;
  reason: string;
  cal_diff?: number;
}

export interface WorkoutExercise {
  id: number;
  day_name: string;
  exercise_name: string;
  category: string;
  target_muscle: string;
  sets: number;
  reps: string;
  duration_sec: number;
  rest_sec: number;
  completed: boolean;
  notes?: string;
}

export interface WorkoutLog {
  id?: number;
  user_id?: number;
  logged_date: string;
  workout_name: string;
  duration_mins: number;
  calories_burned: number;
  difficulty_rating: string;
  completed?: boolean;
  notes?: string;
  created_at?: string;
}

export interface WorkoutPlan {
  id: number;
  user_id: number;
  archetype: string;
  name: string;
  week_start_date: string;
  status: string;
  ai_notes: string;
  created_at: string;
  exercises: WorkoutExercise[];
}

export interface Recommendation {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  reason: string;
  impact_calories: number;
  impact_protein: number;
  status: string;
  created_at: string;
}

export interface DashboardSummary {
  current_weight: number;
  target_weight: number;
  daily_calories_target: number;
  calories_consumed: number;
  calories_remaining: number;
  protein_target_g: number;
  protein_consumed_g: number;
  carbs_target_g: number;
  carbs_consumed_g: number;
  fat_target_g: number;
  fat_consumed_g: number;
  water_goal_liters: number;
  weekly_adherence_pct: number;
  unread_notifications: number;
}

export interface DashboardData {
  has_profile: boolean;
  user_name?: string;
  user_email?: string;
  fitness_archetype?: string;
  summary?: DashboardSummary;
  today_diet?: {
    id: number;
    plan_date: string;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    explanation: string;
    meals: MealPlanItem[];
  };
  today_workout?: {
    id?: number;
    name: string;
    archetype: string;
    ai_notes: string;
    exercises: WorkoutExercise[];
  };
  ai_recommendations?: Recommendation[];
  message?: string;
}

export interface ProgressPoint {
  date: string;
  weight: number;
  target_weight: number;
  calories_actual: number;
  calories_target: number;
  protein_actual: number;
  protein_target: number;
  water_liters: number;
  sleep_hours: number;
  adherence_pct: number;
  workout_completed: boolean;
}

export interface ProgressSummary {
  current_weight: number;
  starting_weight: number;
  target_weight: number;
  weight_change: number;
  avg_calories: number;
  avg_protein: number;
  avg_water: number;
  avg_sleep: number;
  avg_adherence: number;
  total_workouts_completed: number;
  time_series: ProgressPoint[];
}

export interface FeedbackData {
  logged_date: string;
  diet_rating: number;
  workout_rating: number;
  workout_difficulty: 'too_easy' | 'appropriate' | 'too_difficult';
  followed_diet: boolean;
  energy_level: number;
  hunger_level: number;
  comments?: string;
}

export interface FoodScanResult {
  success: boolean;
  detected_food: string;
  confidence_score: number;
  confidence_percentage: string;
  nutritional_estimate: {
    food_name: string;
    confidence: number;
    category: string;
    estimated_calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    serving_size: number;
    serving_unit: string;
    matched_food_item?: FoodItem;
  };
  alternatives: Array<{
    food_name: string;
    confidence: number;
    category: string;
    estimated_calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }>;
  estimation_disclaimer: string;
}

export interface GroceryCategory {
  category_name: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    checked: boolean;
  }>;
}

export interface GroceryListResponse {
  days_covered: number;
  total_items: number;
  categories: GroceryCategory[];
}

export interface MLModelInfo {
  id: number;
  model_name: string;
  algorithm: string;
  version: string;
  mae?: number;
  rmse?: number;
  r2?: number;
  accuracy?: number;
  is_active: boolean;
  parameters: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DatasetOverview {
  name: string;
  record_count: number;
  features_count: number;
  description: string;
  sample_records: Array<Record<string, any>>;
}

export interface SystemOverviewStats {
  total_users: number;
  active_users: number;
  total_experts: number;
  total_meal_plans: number;
  total_workout_plans: number;
  total_recommendations: number;
  avg_system_adherence: number;
  total_feedbacks: number;
}
