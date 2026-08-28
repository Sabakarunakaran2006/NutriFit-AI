import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
  Target,
  Utensils,
  Moon,
  Check,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, updateUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    age: 24,
    gender: 'male',
    height_cm: 175.0,
    weight_kg: 72.0,
    target_weight_kg: 76.0,
    goal: 'muscle_gain',
    activity_level: 'moderate',
    dietary_preference: 'non_vegetarian',
    allergies: [] as string[],
    health_conditions: [] as string[],
    sleep_hours: 7.5,
    stress_level: 'moderate',
    meal_frequency: 4,
  });

  const ALLERGY_OPTIONS = [
    { id: 'dairy', label: 'Dairy (Lactose)' },
    { id: 'nuts', label: 'Tree Nuts & Peanuts' },
    { id: 'gluten', label: 'Gluten / Wheat' },
    { id: 'eggs', label: 'Eggs' },
    { id: 'fish', label: 'Fish & Shellfish' },
    { id: 'soy', label: 'Soy' },
  ];

  const handleAllergyToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(id)
        ? prev.allergies.filter((a) => a !== id)
        : [...prev.allergies, id],
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/profile/', formData);
      if (user) {
        updateUser({ ...user, has_profile: true });
      }
      showToast('success', 'AI Personalized Nutrition & Workout Plan Configured! 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit profile onboarding data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Machine Learning Calibration Wizard</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">Configure Your Health Profile</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          We use Mifflin-St Jeor metabolic modeling and ML regressor pipelines to generate precise targets.
        </p>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-12 bg-emerald-500'
                  : s < step
                  ? 'w-6 bg-emerald-700'
                  : 'w-6 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Biometrics */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <User className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Step 1: Biometrics & Demographics</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
                <input
                  type="number"
                  min="12"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 20 })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={formData.height_cm}
                  onChange={(e) => setFormData({ ...formData, height_cm: parseFloat(e.target.value) || 170 })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Wt (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.5"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: parseFloat(e.target.value) || 70 })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Wt (kg)</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="0.5"
                  value={formData.target_weight_kg}
                  onChange={(e) => setFormData({ ...formData, target_weight_kg: parseFloat(e.target.value) || 65 })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Goal & Activity */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Step 2: Primary Goal & Activity Level</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Primary Fitness Goal</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'muscle_gain', label: 'Muscle Gain (Hypertrophy)', desc: 'High protein + moderate surplus' },
                  { id: 'weight_loss', label: 'Fat Loss (Caloric Deficit)', desc: 'Lean protein + safe 500 kcal deficit' },
                  { id: 'maintenance', label: 'Maintenance & Health', desc: 'Metabolic equilibrium' },
                  { id: 'endurance', label: 'Endurance Performance', desc: 'Carb-dense glycogen replenishment' },
                ].map((g) => (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => setFormData({ ...formData, goal: g.id })}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      formData.goal === g.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md shadow-emerald-950'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-sm block text-white">{g.label}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Daily Physical Activity</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sedentary', label: 'Sedentary', sub: 'Desk job' },
                  { id: 'light', label: 'Light', sub: '1-2 days/wk' },
                  { id: 'moderate', label: 'Moderate', sub: '3-4 days/wk' },
                  { id: 'active', label: 'Active', sub: '5-6 days/wk' },
                  { id: 'very_active', label: 'Very Active', sub: 'Athletic/Heavy' },
                ].map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => setFormData({ ...formData, activity_level: a.id })}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      formData.activity_level === a.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs block text-white">{a.label}</span>
                    <span className="text-[10px] text-slate-500 block">{a.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Dietary Preferences & Allergies */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Step 3: Dietary Preference & Allergies</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Dietary Pattern</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'non_vegetarian', label: 'Non-Veg (Standard)' },
                  { id: 'vegetarian', label: 'Vegetarian' },
                  { id: 'vegan', label: 'Plant-Based / Vegan' },
                  { id: 'keto', label: 'Ketogenic (Low Carb)' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setFormData({ ...formData, dietary_preference: p.id })}
                    className={`p-3 rounded-xl border text-center transition ${
                      formData.dietary_preference === p.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Allergies & Exclusions (Constraint Engine Filter)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALLERGY_OPTIONS.map((opt) => {
                  const isSelected = formData.allergies.includes(opt.id);
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleAllergyToggle(opt.id)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                * The AI recommendation engine will strictly discard all meal candidates with these allergen tags.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Lifestyle Factors */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Moon className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Step 4: Lifestyle & Circadian Rhythm</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sleep Duration (Hours)</label>
                <input
                  type="number"
                  min="4"
                  max="12"
                  step="0.5"
                  value={formData.sleep_hours}
                  onChange={(e) => setFormData({ ...formData, sleep_hours: parseFloat(e.target.value) || 7.5 })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Meal Frequency / Day</label>
                <select
                  value={formData.meal_frequency}
                  onChange={(e) => setFormData({ ...formData, meal_frequency: parseInt(e.target.value) || 4 })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-white outline-none"
                >
                  <option value={3}>3 Meals (Breakfast, Lunch, Dinner)</option>
                  <option value={4}>4 Meals (Breakfast, Lunch, Snack, Dinner)</option>
                  <option value={5}>5 Meals (High Frequency Protocol)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Perceived Daily Stress Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: 'Low', desc: 'Minimal fatigue' },
                  { id: 'moderate', label: 'Moderate', desc: 'Balanced lifestyle' },
                  { id: 'high', label: 'High', desc: 'Elevated cortisol' },
                ].map((st) => (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => setFormData({ ...formData, stress_level: st.id })}
                    className={`p-3 rounded-xl border text-center transition ${
                      formData.stress_level === st.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs block text-white">{st.label}</span>
                    <span className="text-[10px] text-slate-500 block">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-950"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition flex items-center space-x-2 shadow-xl shadow-emerald-950"
            >
              {isLoading ? (
                <span>Calibrating ML Models...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate My Personalized Plan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
