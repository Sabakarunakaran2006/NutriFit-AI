import React, { useEffect, useState } from 'react';
import { Award, Plus, Dumbbell, Clock, Flame, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { workoutService } from '../../services/workoutService';
import { useNotification } from '../../context/NotificationContext';
import { WorkoutLog } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const WorkoutTrackerPage: React.FC = () => {
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form state
  const [workoutName, setWorkoutName] = useState<string>('Push Day (Chest, Shoulders, Triceps)');
  const [durationMins, setDurationMins] = useState<number>(50);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(320);
  const [difficultyRating, setDifficultyRating] = useState<string>('appropriate');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { showToast } = useNotification();
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tracker/daily-summary', { params: { date: todayStr } });
      setWorkoutLogs(res.data.workouts?.logs || []);
    } catch (e) {
      showToast('error', 'Failed to load workout logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await workoutService.completeWorkout({
        logged_date: todayStr,
        workout_name: workoutName,
        duration_mins: durationMins,
        calories_burned: caloriesBurned,
        difficulty_rating: difficultyRating,
        notes,
      });
      showToast('success', 'Workout session logged successfully! 🏆');
      setNotes('');
      loadLogs();
    } catch (e) {
      showToast('error', 'Failed to record workout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading workout activity logger..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Daily Workout Logger</h2>
        </div>
        <p className="text-xs text-slate-400">
          Record training duration, estimated expenditure, and RPE difficulty to power adaptive volume progression.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Plus className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Log Workout Session</h3>
          </div>

          <form onSubmit={handleLogWorkout} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Workout Name / Routine</label>
              <input
                type="text"
                required
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g. Upper Body Hypertrophy"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (mins)</label>
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={durationMins}
                  onChange={(e) => setDurationMins(parseInt(e.target.value) || 30)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Calories Burned</label>
                <input
                  type="number"
                  min="10"
                  max="2000"
                  value={caloriesBurned}
                  onChange={(e) => setCaloriesBurned(parseFloat(e.target.value) || 200)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Perceived Difficulty</label>
              <select
                value={difficultyRating}
                onChange={(e) => setDifficultyRating(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="too_easy">Too Easy (RPE 5-6)</option>
                <option value="appropriate">Appropriate / Optimal (RPE 7-8)</option>
                <option value="too_difficult">Too Difficult / Exhausting (RPE 9-10)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Session Notes (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Added 2.5kg to Incline Bench, felt great power..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-950"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Workout Entry</span>
            </button>
          </form>
        </div>

        {/* History / List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Recorded Workouts ({workoutLogs.length})</h3>
            <span className="text-xs text-slate-400">{todayStr}</span>
          </div>

          {workoutLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No workout sessions logged yet today. Use the form to record completed training.
            </div>
          ) : (
            <div className="space-y-3">
              {workoutLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-white">{log.workout_name}</h5>
                    <div className="flex items-center space-x-4 text-xs text-slate-400">
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                        {log.duration_mins} mins
                      </span>
                      <span className="flex items-center">
                        <Flame className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        {log.calories_burned} kcal
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                        {log.difficulty_rating}
                      </span>
                    </div>
                    {log.notes && <p className="text-xs text-slate-500 mt-1 italic">{log.notes}</p>}
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
