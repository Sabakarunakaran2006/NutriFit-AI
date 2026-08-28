import React, { useEffect, useState } from 'react';
import { User, Save, Target, Utensils, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Profile } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArchetypeBadge } from '../../components/ai/ArchetypeBadge';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useNotification();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/profile/me');
      setProfile(res.data);
    } catch (e) {
      setError('Could not load profile. You may need to complete onboarding.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await api.put('/profile/me', profile);
      setProfile(res.data);
      showToast('success', 'Profile updated & ML targets recalibrated!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading profile settings..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
        Profile not initialized. Please complete onboarding.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">My Health Profile</h2>
          </div>
          <p className="text-xs text-slate-400">
            Updating your weight or goal triggers real-time BMR, TDEE, and ML caloric recalculation.
          </p>
        </div>

        <ArchetypeBadge archetype={profile.fitness_archetype} />
      </div>

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Calculated Engine Values */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>Live Calculated Baselines & Targets</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Basal Metabolic Rate (BMR)</span>
            <span className="text-lg font-black text-white">{profile.bmr} kcal</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Total Daily Expenditure (TDEE)</span>
            <span className="text-lg font-black text-sky-400">{profile.tdee} kcal</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Target Daily Calorie Goal</span>
            <span className="text-lg font-black text-emerald-400">{profile.target_calories} kcal</span>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-slate-400 block">Protein Target Distribution</span>
            <span className="text-lg font-black text-indigo-400">{profile.target_protein} g</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 20 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
            <input
              type="number"
              value={profile.height_cm}
              onChange={(e) => setProfile({ ...profile, height_cm: parseFloat(e.target.value) || 170 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Current Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              value={profile.weight_kg}
              onChange={(e) => setProfile({ ...profile, weight_kg: parseFloat(e.target.value) || 70 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              value={profile.target_weight_kg}
              onChange={(e) => setProfile({ ...profile, target_weight_kg: parseFloat(e.target.value) || 65 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Goal</label>
            <select
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="muscle_gain">Muscle Gain</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="maintenance">Maintenance</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Activity Level</label>
            <select
              value={profile.activity_level}
              onChange={(e) => setProfile({ ...profile, activity_level: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Dietary Preference</label>
            <select
              value={profile.dietary_preference}
              onChange={(e) => setProfile({ ...profile, dietary_preference: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="non_vegetarian">Non-Vegetarian</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Sleep (Hours)</label>
            <input
              type="number"
              step="0.5"
              value={profile.sleep_hours}
              onChange={(e) => setProfile({ ...profile, sleep_hours: parseFloat(e.target.value) || 7.5 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Stress Level</label>
            <select
              value={profile.stress_level}
              onChange={(e) => setProfile({ ...profile, stress_level: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-950"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes & Recalibrate Targets</span>
        </button>
      </form>
    </div>
  );
};
