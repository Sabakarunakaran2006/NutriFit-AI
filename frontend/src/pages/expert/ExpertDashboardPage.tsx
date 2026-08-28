import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertTriangle, CheckCircle2, Stethoscope, ArrowRight, Sparkles, Search } from 'lucide-react';
import { expertService } from '../../services/expertService';
import { useNotification } from '../../context/NotificationContext';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ExpertDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { showToast } = useNotification();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await expertService.getDashboard();
      setDashboardData(data);
    } catch (e) {
      showToast('error', 'Failed to load expert dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading clinical & nutritionist portal..." />
      </div>
    );
  }

  if (!dashboardData) return null;

  const filteredUsers = dashboardData.users?.filter((u: any) =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.goal.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Stethoscope className="w-5 h-5 text-sky-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Expert Clinical & Nutritionist Portal
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Welcome, <strong>{dashboardData.expert_name}</strong>. Review AI recommendations, monitor client adherence flags, and calibrate training parameters.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-sky-500/10 border border-sky-500/20 px-3.5 py-2 rounded-xl text-sky-300 text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>AI Decision Support Active</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Assigned Clients"
          value={dashboardData.total_assigned_users}
          subtitle="Active monitored individuals"
          icon={Users}
          color="sky"
        />

        <StatCard
          title="Clients Needing Attention"
          value={dashboardData.users_needing_attention}
          subtitle="Low adherence or fatigue flags"
          icon={AlertTriangle}
          color="rose"
        />

        <StatCard
          title="Average Client Adherence"
          value={`${dashboardData.average_client_adherence}%`}
          subtitle="Plan compliance rate"
          progress={dashboardData.average_client_adherence}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Assigned Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">Client Roster & Monitoring</h3>
            <p className="text-xs text-slate-400">Select a client to review AI-generated meal and workout plans</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by client name, goal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Client</th>
                <th className="py-3 px-3">Goal & Archetype</th>
                <th className="py-3 px-3">Weight (Cur / Target)</th>
                <th className="py-3 px-3">Adherence</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-850/60 transition">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white text-sm">{u.full_name}</div>
                    <div className="text-slate-500 text-[11px]">{u.email}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-slate-200 capitalize">{u.goal.replace('_', ' ')}</div>
                    <div className="text-sky-400 text-[11px]">{u.fitness_archetype}</div>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-slate-300">
                    {u.current_weight} kg <span className="text-slate-500">→</span> {u.target_weight} kg
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            u.adherence_pct >= 80 ? 'bg-emerald-500' : u.adherence_pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${u.adherence_pct}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-300">{u.adherence_pct}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    {u.needs_attention ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-[10px]">
                        Needs Attention
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        On Track
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      to={`/expert/user/${u.id}`}
                      className="px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold transition inline-flex items-center space-x-1"
                    >
                      <span>Review Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
