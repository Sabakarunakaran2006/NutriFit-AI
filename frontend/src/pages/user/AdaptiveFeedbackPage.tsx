import React, { useEffect, useState } from 'react';
import { MessageSquareHeart, Sparkles, Send, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';
import { useNotification } from '../../context/NotificationContext';
import { FeedbackData } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { RecommendationReason } from '../../components/ai/RecommendationReason';

export const AdaptiveFeedbackPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [latestAdjustment, setLatestAdjustment] = useState<any | null>(null);

  // Form State
  const [dietRating, setDietRating] = useState<number>(4);
  const [workoutRating, setWorkoutRating] = useState<number>(4);
  const [workoutDifficulty, setWorkoutDifficulty] = useState<'too_easy' | 'appropriate' | 'too_difficult'>('appropriate');
  const [followedDiet, setFollowedDiet] = useState<boolean>(true);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [hungerLevel, setHungerLevel] = useState<number>(5);
  const [comments, setComments] = useState<string>('');

  const { showToast } = useNotification();
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadFeedbackHistory();
  }, []);

  const loadFeedbackHistory = async () => {
    setIsLoading(true);
    try {
      const data = await feedbackService.getFeedbackHistory();
      setHistory(data);
    } catch (e) {
      showToast('error', 'Failed to load feedback history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: FeedbackData = {
        logged_date: todayStr,
        diet_rating: dietRating,
        workout_rating: workoutRating,
        workout_difficulty: workoutDifficulty,
        followed_diet: followedDiet,
        energy_level: energyLevel,
        hunger_level: hungerLevel,
        comments,
      };

      const res = await feedbackService.submitFeedback(payload);
      setLatestAdjustment(res.adaptive_adjustment);
      showToast('success', 'Feedback processed by Adaptive Recommendation Engine!');
      setComments('');
      loadFeedbackHistory();
    } catch (e: any) {
      showToast('error', e.response?.data?.detail || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading adaptive feedback engine..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dynamic Metabolic & Training Adaptation</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Adaptive AI Feedback Loop</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Unlike static calorie calculators, NutriFit monitors your subjective energy, hunger, and workout adherence over time, dynamically adapting calorie budgets and training volume safely.
        </p>
      </div>

      {/* Latest AI Recalibration Result Banner */}
      {latestAdjustment && (
        <div className="p-6 bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/30 rounded-3xl shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <Sparkles className="w-5 h-5" />
            <span>AI Plan Recalibration Applied</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Calorie Target Adjustment</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-slate-400 line-through">{Math.round(latestAdjustment.old_target_calories)} kcal</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-base font-extrabold text-white">{Math.round(latestAdjustment.new_target_calories)} kcal</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Protein Target Adjustment</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-slate-400 line-through">{Math.round(latestAdjustment.old_target_protein)} g</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-base font-extrabold text-white">{Math.round(latestAdjustment.new_target_protein)} g</span>
              </div>
            </div>
          </div>

          <RecommendationReason
            badgeText="Recalibration Rationale"
            reason={latestAdjustment.ai_explanation}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Check-in Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <MessageSquareHeart className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-base text-white">Daily Feedback Check-in</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Diet & Workout Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  How was today's diet adherence? (1-5)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setDietRating(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                        dietRating === num
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {num} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  How was today's workout performance? (1-5)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setWorkoutRating(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                        workoutRating === num
                          ? 'bg-indigo-500 text-white border-indigo-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {num} ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Workout Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Was the recommended workout intensity appropriate?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'too_easy', label: 'Too Easy', desc: 'Could do more volume' },
                  { id: 'appropriate', label: 'Optimal', desc: 'Challenging & recovered' },
                  { id: 'too_difficult', label: 'Too Difficult', desc: 'Overreached / sore' },
                ].map((d) => (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => setWorkoutDifficulty(d.id as any)}
                    className={`p-3 rounded-xl border text-center transition ${
                      workoutDifficulty === d.id
                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs block text-white">{d.label}</span>
                    <span className="text-[10px] text-slate-500 block">{d.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders: Energy & Hunger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Subjective Energy Level</label>
                  <span className="text-xs font-bold text-emerald-400">{energyLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 mt-2"
                />
                <span className="text-[10px] text-slate-500 block mt-1">1: Exhausted • 10: Peak Energy</span>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">Subjective Hunger Level</label>
                  <span className="text-xs font-bold text-amber-400">{hungerLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={hungerLevel}
                  onChange={(e) => setHungerLevel(parseInt(e.target.value))}
                  className="w-full accent-amber-500 mt-2"
                />
                <span className="text-[10px] text-slate-500 block mt-1">1: Satiated/Full • 10: Starving</span>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Additional Comments / Perceptions (Optional)
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Felt great on bench press, but feeling slightly hungry before bed..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition flex items-center justify-center space-x-2 shadow-xl shadow-emerald-950"
            >
              <Send className="w-4 h-4" />
              <span>Submit Daily Check-in & Recalibrate</span>
            </button>
          </form>
        </div>

        {/* Feedback History & Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white pb-3 border-b border-slate-800">
            Check-in History ({history.length})
          </h3>

          {history.length === 0 ? (
            <p className="text-center text-xs text-slate-500 py-12">No previous feedback logged yet.</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.logged_date}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Diet: {item.diet_rating}★ | Work: {item.workout_rating}★
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>Energy: {item.energy_level}/10</span>
                    <span>Hunger: {item.hunger_level}/10</span>
                    <span className="capitalize">{item.workout_difficulty.replace('_', ' ')}</span>
                  </div>

                  {item.ai_response && (
                    <div className="pt-2 border-t border-slate-800/60 text-[11px] text-emerald-400 leading-snug">
                      <strong>AI Response:</strong> {item.ai_response}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
