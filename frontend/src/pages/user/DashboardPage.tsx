import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Flame,
  Dumbbell,
  Droplets,
  TrendingUp,
  Scale,
  Sparkles,
  RefreshCw,
  Plus,
  Camera,
  MessageSquareHeart,
  ShoppingCart,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { dashboardService } from '../../services/dashboardService';
import { workoutService } from '../../services/workoutService';
import { DashboardData, MealPlanItem } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArchetypeBadge } from '../../components/ai/ArchetypeBadge';
import { AIInsightCard } from '../../components/ai/AIInsightCard';
import { MealCard } from '../../components/diet/MealCard';
import { MealReplaceModal } from '../../components/diet/MealReplaceModal';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { RestTimerModal } from '../../components/workout/RestTimerModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMealForReplace, setSelectedMealForReplace] = useState<MealPlanItem | null>(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState<boolean>(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState<number>(0);
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getDashboardData();
      if (!res.has_profile) {
        navigate('/onboarding');
        return;
      }
      setData(res);
    } catch (e: any) {
      showToast('error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExercise = async (exerciseId: number, completed: boolean) => {
    try {
      await workoutService.toggleExercise(exerciseId, completed);
      setData((prev) => {
        if (!prev || !prev.today_workout) return prev;
        return {
          ...prev,
          today_workout: {
            ...prev.today_workout,
            exercises: prev.today_workout.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, completed } : ex
            ),
          },
        };
      });
      showToast('success', completed ? 'Exercise marked complete! 🏋️' : 'Exercise unchecked');
    } catch (e) {
      showToast('error', 'Could not update exercise state');
    }
  };

  const handleAddMealToTracker = async (meal: MealPlanItem) => {
    try {
      await api.post('/tracker/meal', {
        logged_date: new Date().toISOString().split('T')[0],
        meal_type: meal.meal_type,
        food_item_id: meal.food_item_id,
        food_name: meal.custom_name,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        serving_size: meal.serving_amount,
        serving_unit: meal.serving_unit,
      });
      showToast('success', `Added ${meal.custom_name} to today's meal tracker!`);
      loadDashboard();
    } catch (e) {
      showToast('error', 'Failed to log meal');
    }
  };

  const handleOpenRestTimer = (seconds: number) => {
    setRestTimerSeconds(seconds);
    setIsTimerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your AI Health Matrix & Plan..." />
      </div>
    );
  }

  if (!data || !data.summary) return null;

  const s = data.summary;
  const calPercent = Math.min(100, Math.round((s.calories_consumed / s.daily_calories_target) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {data.user_name?.split(' ')[0] || user?.full_name?.split(' ')[0]} 👋
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Your daily nutrition targets and resistance splits are dynamically synchronized with your metabolic rate and feedback loop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {data.fitness_archetype && (
            <ArchetypeBadge archetype={data.fitness_archetype} className="py-2 px-3 text-xs" />
          )}
          <Link
            to="/feedback"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <MessageSquareHeart className="w-4 h-4 text-rose-400" />
            <span>Daily Check-in</span>
          </Link>
        </div>
      </div>

      {/* 2. Health Summary Cards (Database Powered) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Current Weight"
          value={s.current_weight}
          unit="kg"
          subtitle={`Target: ${s.target_weight} kg`}
          icon={Scale}
          color="emerald"
        />

        <StatCard
          title="Target Weight"
          value={s.target_weight}
          unit="kg"
          subtitle={`Δ ${Math.abs(Math.round((s.current_weight - s.target_weight) * 10) / 10)} kg remaining`}
          icon={TrendingUp}
          color="sky"
        />

        <StatCard
          title="Daily Calories"
          value={s.daily_calories_target}
          unit="kcal"
          subtitle={`${s.calories_consumed} kcal eaten (${s.calories_remaining} left)`}
          progress={calPercent}
          icon={Flame}
          color="amber"
        />

        <StatCard
          title="Protein Target"
          value={s.protein_target_g}
          unit="g"
          subtitle={`${s.protein_consumed_g}g consumed today`}
          progress={Math.min(100, Math.round((s.protein_consumed_g / s.protein_target_g) * 100))}
          icon={Dumbbell}
          color="indigo"
        />

        <StatCard
          title="Water Goal"
          value={s.water_goal_liters}
          unit="L"
          subtitle="Optimal cellular hydration"
          icon={Droplets}
          color="purple"
        />

        <StatCard
          title="Weekly Adherence"
          value={`${s.weekly_adherence_pct}%`}
          subtitle="Plan compliance score"
          progress={s.weekly_adherence_pct}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* 3. AI Recommendations & Explainable Insights */}
      {data.ai_recommendations && data.ai_recommendations.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Active AI Recommendations & Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.ai_recommendations.map((rec) => (
              <AIInsightCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* 4. Today's Personalized Diet */}
      {data.today_diet && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-lg font-black text-white tracking-tight">Today's Personalized Diet</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Macro Target: {data.today_diet.total_calories} kcal • {data.today_diet.total_protein}g P • {data.today_diet.total_carbs}g C • {data.today_diet.total_fat}g F
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/food-scanner"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>AI Food Scanner</span>
              </Link>
              <Link
                to="/grocery-list"
                className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>Grocery List</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.today_diet.meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onReplaceClick={(m) => {
                  setSelectedMealForReplace(m);
                  setIsReplaceModalOpen(true);
                }}
                onAddToTracker={handleAddMealToTracker}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Today's Recommended Workout */}
      {data.today_workout && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <h3 className="text-lg font-black text-white tracking-tight">Today's Recommended Workout</h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {data.today_workout.name} • {data.today_workout.exercises.length} Exercises Scheduled
              </p>
            </div>

            <Link
              to="/workout-plan"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
            >
              View Full Weekly Split →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.today_workout.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onToggleComplete={handleToggleExercise}
                onStartRestTimer={handleOpenRestTimer}
              />
            ))}
          </div>
        </div>
      )}

      {/* Meal Replacement Modal */}
      <MealReplaceModal
        isOpen={isReplaceModalOpen}
        onClose={() => setIsReplaceModalOpen(false)}
        mealItem={selectedMealForReplace}
        onReplacementApplied={() => {
          showToast('success', 'Meal replaced successfully! Daily totals updated.');
          loadDashboard();
        }}
      />

      {/* Rest Timer Modal */}
      <RestTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        initialSeconds={restTimerSeconds}
      />
    </div>
  );
};
