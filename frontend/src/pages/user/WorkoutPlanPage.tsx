import React, { useEffect, useState } from 'react';
import { RefreshCw, Dumbbell, Sparkles, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { workoutService } from '../../services/workoutService';
import { useNotification } from '../../context/NotificationContext';
import { WorkoutPlan, WorkoutExercise } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ExerciseCard } from '../../components/workout/ExerciseCard';
import { RestTimerModal } from '../../components/workout/RestTimerModal';
import { ArchetypeBadge } from '../../components/ai/ArchetypeBadge';

export const WorkoutPlanPage: React.FC = () => {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [restSeconds, setRestSeconds] = useState<number>(60);

  const { showToast } = useNotification();

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    setIsLoading(true);
    try {
      const plan = await workoutService.getWorkoutPlan();
      setWorkoutPlan(plan);
      // Auto select first day with exercises
      if (plan.exercises.length > 0) {
        setSelectedDay(plan.exercises[0].day_name);
      }
    } catch (e) {
      showToast('error', 'Failed to load workout plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newPlan = await workoutService.regenerateWorkoutPlan();
      setWorkoutPlan(newPlan);
      showToast('success', 'Workout routine re-clustered and updated!');
    } catch (e) {
      showToast('error', 'Failed to regenerate workout');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleExercise = async (exerciseId: number, completed: boolean) => {
    try {
      await workoutService.toggleExercise(exerciseId, completed);
      setWorkoutPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          exercises: prev.exercises.map((ex) =>
            ex.id === exerciseId ? { ...ex, completed } : ex
          ),
        };
      });
      showToast('success', completed ? 'Exercise completed! 💪' : 'Exercise unchecked');
    } catch (e) {
      showToast('error', 'Could not update exercise status');
    }
  };

  const handleOpenRestTimer = (seconds: number) => {
    setRestSeconds(seconds);
    setIsTimerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading your periodized workout split..." />
      </div>
    );
  }

  const currentDayExercises =
    workoutPlan?.exercises.filter((ex) => ex.day_name === selectedDay) || [];

  const completedCount = currentDayExercises.filter((ex) => ex.completed).length;
  const totalDayCount = currentDayExercises.length;
  const dayProgress = totalDayCount > 0 ? (completedCount / totalDayCount) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            {workoutPlan && <ArchetypeBadge archetype={workoutPlan.archetype} />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {workoutPlan?.name || 'Personalized Workout Protocol'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {workoutPlan?.ai_notes || 'Periodized resistance routine matched from K-Means clustering.'}
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-indigo-950 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>Re-cluster Routine</span>
        </button>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {DAYS.map((day) => {
          const count = workoutPlan?.exercises.filter((ex) => ex.day_name === day).length || 0;
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 flex-shrink-0 border ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-950'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{day}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Daily Progress & Exercise List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-extrabold text-lg text-white">{selectedDay}'s Routine</h3>
            <p className="text-xs text-slate-400">
              {completedCount} of {totalDayCount} exercises completed
            </p>
          </div>

          {totalDayCount > 0 && (
            <div className="w-full sm:w-48 space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Completion</span>
                <span className="text-indigo-400">{Math.round(dayProgress)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${dayProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {currentDayExercises.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">Rest & Recovery Day</p>
            <p className="text-xs text-slate-600 mt-1">
              No strenuous resistance training scheduled for {selectedDay}. Focus on hydration and mobility.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDayExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onToggleComplete={handleToggleExercise}
                onStartRestTimer={handleOpenRestTimer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rest Timer Modal */}
      <RestTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        initialSeconds={restSeconds}
      />
    </div>
  );
};
