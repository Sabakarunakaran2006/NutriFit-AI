import React, { useEffect, useState } from 'react';
import { LineChart as ChartIcon, Plus, Scale, TrendingUp, Droplets, Moon, CheckCircle2 } from 'lucide-react';
import { progressService } from '../../services/progressService';
import { useNotification } from '../../context/NotificationContext';
import { ProgressSummary } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { ProgressCharts } from '../../components/progress/ProgressCharts';
import { Modal } from '../../components/common/Modal';

export const ProgressPage: React.FC = () => {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState<boolean>(false);
  const [timeframeDays, setTimeframeDays] = useState<number>(30);

  // New progress log entry form
  const [weightKg, setWeightKg] = useState<number>(72.0);
  const [caloriesConsumed, setCaloriesConsumed] = useState<number>(2400);
  const [proteinConsumed, setProteinConsumed] = useState<number>(150);
  const [waterLiters, setWaterLiters] = useState<number>(3.0);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [energyLevel, setEnergyLevel] = useState<number>(8);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { showToast } = useNotification();
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadProgress();
  }, [timeframeDays]);

  const loadProgress = async () => {
    setIsLoading(true);
    try {
      const data = await progressService.getProgressSummary(timeframeDays);
      setSummary(data);
      if (data.current_weight) setWeightKg(data.current_weight);
    } catch (e) {
      showToast('error', 'Failed to load progress analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await progressService.logProgress({
        logged_date: todayStr,
        weight_kg: weightKg,
        calories_consumed: caloriesConsumed,
        protein_consumed: proteinConsumed,
        water_liters: waterLiters,
        sleep_hours: sleepHours,
        energy_level: energyLevel,
        notes,
      });
      showToast('success', 'Biometric progress entry recorded!');
      setIsLogModalOpen(false);
      loadProgress();
    } catch (e) {
      showToast('error', 'Failed to save progress entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Synthesizing biometric progression curves..." />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <ChartIcon className="w-5 h-5 text-emerald-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Progress & Analytics</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Longitudinal biometric tracking, target compliance variance, and progressive overload trends.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <select
            value={timeframeDays}
            onChange={(e) => setTimeframeDays(parseInt(e.target.value))}
            className="px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-white outline-none focus:border-emerald-500"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-950"
          >
            <Plus className="w-4 h-4" />
            <span>Log Today's Metrics</span>
          </button>
        </div>
      </div>

      {/* Metric Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Current Weight"
          value={summary.current_weight}
          unit="kg"
          subtitle={`Started at ${summary.starting_weight} kg`}
          trend={{
            value: `${Math.abs(summary.weight_change)} kg`,
            positive: summary.weight_change >= 0,
          }}
          icon={Scale}
          color="emerald"
        />

        <StatCard
          title="Avg Daily Intake"
          value={Math.round(summary.avg_calories)}
          unit="kcal"
          subtitle="Mean caloric compliance"
          icon={TrendingUp}
          color="sky"
        />

        <StatCard
          title="Avg Daily Protein"
          value={Math.round(summary.avg_protein)}
          unit="g"
          subtitle="Mean myofibrillar protein"
          icon={TrendingUp}
          color="indigo"
        />

        <StatCard
          title="System Adherence"
          value={`${Math.round(summary.avg_adherence)}%`}
          subtitle={`${summary.total_workouts_completed} workouts recorded`}
          progress={summary.avg_adherence}
          icon={CheckCircle2}
          color="amber"
        />
      </div>

      {/* Visual Recharts Charts */}
      <ProgressCharts data={summary.time_series} />

      {/* Log Progress Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Record Daily Biometric & Nutrition Check-in"
      >
        <form onSubmit={handleLogProgress} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Today's Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Calories Consumed</label>
              <input
                type="number"
                min="500"
                max="6000"
                value={caloriesConsumed}
                onChange={(e) => setCaloriesConsumed(parseInt(e.target.value) || 2000)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Protein Consumed (g)</label>
              <input
                type="number"
                min="10"
                max="400"
                value={proteinConsumed}
                onChange={(e) => setProteinConsumed(parseInt(e.target.value) || 120)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Water Drank (Liters)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={waterLiters}
                onChange={(e) => setWaterLiters(parseFloat(e.target.value) || 2.5)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sleep Duration (Hours)</label>
              <input
                type="number"
                step="0.5"
                min="3"
                max="14"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value) || 7.0)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">Energy Level (1-10)</label>
                <span className="text-xs font-bold text-emerald-400">{energyLevel}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                className="w-full accent-emerald-500 mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Felt great recovery, hit all macros..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Progress Entry</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};
