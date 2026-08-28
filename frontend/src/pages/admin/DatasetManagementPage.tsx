import React, { useEffect, useState } from 'react';
import { Database, Sparkles, FileSpreadsheet, Eye, HardDrive } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../context/NotificationContext';
import { DatasetOverview } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const DatasetManagementPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetOverview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { showToast } = useNotification();

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDatasets();
      setDatasets(data);
    } catch (e) {
      showToast('error', 'Failed to load dataset registry');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Reading training datasets & feature catalogs..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dataset & Feature Store Registry
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-xl">
          Inspect training corpora, feature counts, and distributions for caloric regression and nutritional constraint optimization.
        </p>
      </div>

      {/* Dataset Cards */}
      <div className="space-y-6">
        {datasets.map((d) => (
          <div key={d.name} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">{d.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{d.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-bold text-slate-200">
                  {d.record_count.toLocaleString()} Records
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-bold text-emerald-400">
                  {d.features_count} Features
                </span>
              </div>
            </div>

            {/* Sample Records JSON Table */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Sample Record Previews
              </span>
              <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-emerald-300">
                  {JSON.stringify(d.sample_records, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
