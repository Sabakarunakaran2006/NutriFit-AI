import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Brain, Database, CheckCircle2, TrendingUp, Sparkles, MessageSquareHeart } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { SystemOverviewStats } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<SystemOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { showToast } = useNotification();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getOverview();
      setStats(data);
    } catch (e) {
      showToast('error', 'Failed to load system metrics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading administrative metrics..." />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-5 h-5 text-rose-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Administrative Control Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Live system telemetry, user & expert access governance, and machine learning model lifecycle management.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/models"
            className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Brain className="w-4 h-4 text-rose-400" />
            <span>ML Model Center</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={stats.total_users}
          subtitle={`${stats.active_users} active accounts`}
          icon={Users}
          color="emerald"
        />

        <StatCard
          title="Fitness Experts"
          value={stats.total_experts}
          subtitle="Certified staff"
          icon={Shield}
          color="sky"
        />

        <StatCard
          title="Diet Plans"
          value={stats.total_meal_plans}
          subtitle="Generated meal splits"
          icon={TrendingUp}
          color="indigo"
        />

        <StatCard
          title="Workout Plans"
          value={stats.total_workout_plans}
          subtitle="Assigned splits"
          icon={TrendingUp}
          color="purple"
        />

        <StatCard
          title="AI Recommendations"
          value={stats.total_recommendations}
          subtitle="Generated insights"
          icon={Sparkles}
          color="amber"
        />

        <StatCard
          title="Avg System Adherence"
          value={`${stats.avg_system_adherence}%`}
          subtitle={`${stats.total_feedbacks} feedback logs`}
          progress={stats.avg_system_adherence}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="p-6 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl transition shadow-xl space-y-3 group"
        >
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit group-hover:scale-110 transition">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-base text-white">User & Expert Management</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Search, filter, view biometrics, activate/deactivate accounts, and assign clients to nutrition experts.
          </p>
        </Link>

        <Link
          to="/admin/models"
          className="p-6 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl transition shadow-xl space-y-3 group"
        >
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl w-fit group-hover:scale-110 transition">
            <Brain className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-base text-white">ML Model Management</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect model comparison metrics (MAE, RMSE, R²), monitor training epochs, and trigger 1-click model retraining.
          </p>
        </Link>

        <Link
          to="/admin/datasets"
          className="p-6 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl transition shadow-xl space-y-3 group"
        >
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit group-hover:scale-110 transition">
            <Database className="w-6 h-6" />
          </div>
          <h4 className="font-extrabold text-base text-white">Dataset Registry</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect demographic training datasets, food item nutritional distribution, and periodized workout templates.
          </p>
        </Link>
      </div>
    </div>
  );
};
