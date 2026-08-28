import React, { useEffect, useState } from 'react';
import { Brain, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Activity, Layers, ArrowUpRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { MLModelInfo } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MLManagementPage: React.FC = () => {
  const [models, setModels] = useState<MLModelInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRetraining, setIsRetraining] = useState<boolean>(false);
  const [retrainSummary, setRetrainSummary] = useState<any | null>(null);

  const { showToast } = useNotification();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getMLModels();
      setModels(data);
    } catch (e) {
      showToast('error', 'Failed to load ML registry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrainAll = async () => {
    setIsRetraining(true);
    setRetrainSummary(null);
    try {
      const res = await adminService.retrainModels();
      setRetrainSummary(res);
      setModels(res.models_trained);
      showToast('success', `Models retrained! Best algorithm: ${res.best_model}`);
    } catch (e: any) {
      showToast('error', 'Model retraining pipeline failed');
    } finally {
      setIsRetraining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Inspecting ML model registry & evaluation matrices..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="w-5 h-5 text-rose-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Machine Learning Model Registry
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Live comparison of regression algorithms (Linear Regression, Random Forest, Gradient Boosting) and unsupervised K-Means user clustering.
          </p>
        </div>

        <button
          onClick={handleRetrainAll}
          disabled={isRetraining}
          className="px-5 py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xl shadow-rose-950 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
          <span>{isRetraining ? 'Training in background...' : 'Retrain All ML Models'}</span>
        </button>
      </div>

      {/* Retrain feedback notification */}
      {retrainSummary && (
        <div className="p-6 bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-500/30 rounded-3xl space-y-3 shadow-xl animate-in fade-in">
          <div className="flex items-center space-x-2 text-rose-300 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Retraining Complete — Best Active Algorithm: {retrainSummary.best_model}</span>
          </div>
          <p className="text-xs text-slate-300">
            K-Means Silhouette Score: <strong>{retrainSummary.clustering_silhouette_score}</strong>. All model weights and joblib serialization artifacts updated in backend.
          </p>
        </div>
      )}

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((m) => (
          <div
            key={m.id}
            className={`p-6 rounded-3xl border transition shadow-xl space-y-4 ${
              m.is_active
                ? 'bg-slate-900 border-emerald-500/40 shadow-emerald-950/20'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                      m.is_active
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {m.is_active ? 'Active Production Model' : 'Candidate Benchmark'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{m.version}</span>
                </div>
                <h4 className="font-extrabold text-base text-white mt-1.5">{m.model_name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Algorithm: {m.algorithm}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-emerald-400">
                <Brain className="w-6 h-6" />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">MAE</span>
                <span className="text-sm font-black text-white">
                  {m.mae !== null && m.mae !== undefined ? `${m.mae} kcal` : 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">RMSE</span>
                <span className="text-sm font-black text-sky-400">
                  {m.rmse !== null && m.rmse !== undefined ? `${m.rmse} kcal` : 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">R² Score</span>
                <span className="text-sm font-black text-emerald-400">
                  {m.r2 !== null && m.r2 !== undefined ? m.r2 : 'N/A'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Last Trained: {new Date(m.updated_at || m.created_at).toLocaleDateString()}</span>
              <span>Scikit-Learn Joblib</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
