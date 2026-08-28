import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Sparkles, MessageSquare, Send, CheckCircle2, Flame, Dumbbell } from 'lucide-react';
import { expertService } from '../../services/expertService';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MacroBar } from '../../components/diet/MacroBar';

export const UserReviewPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [noteTitle, setNoteTitle] = useState<string>('Clinical Macro & Recovery Guidance');
  const [noteMessage, setNoteMessage] = useState<string>('');
  const [calAdjustment, setCalAdjustment] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { showToast } = useNotification();

  useEffect(() => {
    if (userId) loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    setIsLoading(true);
    try {
      const res = await expertService.getUserDetails(parseInt(userId!));
      setData(res);
    } catch (e) {
      showToast('error', 'Failed to load client details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteMessage.trim()) return;

    setIsSubmitting(true);
    try {
      await expertService.addExpertNote({
        user_id: parseInt(userId!),
        title: noteTitle,
        message: noteMessage,
        calorie_adjustment: calAdjustment,
      });
      showToast('success', 'Expert note and clinical recommendations delivered to client!');
      setNoteMessage('');
      loadUserDetails();
    } catch (e) {
      showToast('error', 'Failed to attach expert note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading client clinical matrix..." />
      </div>
    );
  }

  if (!data) return null;

  const u = data.user;
  const p = data.profile;
  const mealPlan = data.meal_plan;
  const workoutPlan = data.workout_plan;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back button */}
      <div>
        <Link
          to="/expert"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expert Dashboard</span>
        </Link>
      </div>

      {/* Client Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">{u.full_name}</h2>
            <span className="px-2.5 py-0.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase">
              {p?.fitness_archetype || 'Client'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {u.email} • Goal: <strong className="text-slate-200 capitalize">{p?.goal.replace('_', ' ')}</strong> • Activity: <strong className="text-slate-200">{p?.activity_level}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Weight</span>
            <span className="text-sm font-bold text-white">{p?.weight_kg} kg → {p?.target_weight_kg} kg</span>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Calorie Target</span>
            <span className="text-sm font-bold text-emerald-400">{p?.target_calories} kcal</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Diet & Workout Plans */}
        <div className="space-y-6">
          {/* Diet Plan */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Active AI Meal Split</h3>
              </div>
              <span className="text-xs font-bold text-emerald-400">{mealPlan?.total_calories} kcal</span>
            </div>

            {mealPlan ? (
              <div className="space-y-3">
                <MacroBar
                  protein={mealPlan.total_protein}
                  carbs={mealPlan.total_carbs}
                  fat={mealPlan.total_fat}
                  totalCalories={mealPlan.total_calories}
                />
                <div className="space-y-2 pt-2">
                  {mealPlan.items.map((i: any) => (
                    <div key={i.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex justify-between">
                      <div>
                        <span className="font-bold text-white uppercase text-[10px] block text-slate-500">{i.meal_type}</span>
                        <span className="font-semibold text-slate-200">{i.custom_name}</span>
                      </div>
                      <div className="text-right text-slate-400 text-[11px]">
                        <span className="font-bold text-emerald-400">{i.calories} kcal</span>
                        <span className="block">{i.protein_g}g P</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active meal plan generated yet.</p>
            )}
          </div>

          {/* Workout Split */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Assigned Resistance Split</h3>
              </div>
              <span className="text-xs font-bold text-indigo-400">{workoutPlan?.archetype}</span>
            </div>

            {workoutPlan ? (
              <div className="space-y-2">
                {workoutPlan.exercises.slice(0, 5).map((ex: any) => (
                  <div key={ex.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">{ex.exercise_name}</span>
                      <span className="text-slate-500 block text-[11px]">{ex.day_name} • {ex.target_muscle}</span>
                    </div>
                    <span className="font-mono text-slate-300">{ex.sets} × {ex.reps}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active workout plan assigned.</p>
            )}
          </div>
        </div>

        {/* Expert Notes & Recommendation Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 h-fit">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-base text-white">Deliver Clinical Feedback Note</h3>
          </div>

          <form onSubmit={handleSendNote} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Header</label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Clinical Recommendation & Guidance
              </label>
              <textarea
                rows={4}
                required
                value={noteMessage}
                onChange={(e) => setNoteMessage(e.target.value)}
                placeholder="I reviewed your recent logs and notice slight fatigue on Leg days. Let's add 100 kcal of complex carbs pre-workout..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Optional Calorie Offset (+/- kcal)
              </label>
              <input
                type="number"
                step="50"
                value={calAdjustment}
                onChange={(e) => setCalAdjustment(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-sky-950"
            >
              <Send className="w-4 h-4" />
              <span>Send Expert Recommendation to Client</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
