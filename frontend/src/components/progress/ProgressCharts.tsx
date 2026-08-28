import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { ProgressPoint } from '../../types';

interface Props {
  data: ProgressPoint[];
}

export const ProgressCharts: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
        No historical progress data recorded yet.
      </div>
    );
  }

  // Format short date for X axis
  const formattedData = data.map((d) => ({
    ...d,
    shortDate: d.date.split('-').slice(1).join('/'),
  }));

  const customTooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: '12px',
    color: '#f8fafc',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  };

  return (
    <div className="space-y-6">
      {/* 1. Weight Progression Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-white">Weight Progression Trajectory</h4>
            <p className="text-xs text-slate-400">Actual weight logs vs target threshold</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Target: {data[0]?.target_weight} kg
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="shortDate" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" tick={{ fontSize: 11 }} unit="kg" />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="weight"
                name="Actual Weight (kg)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="target_weight"
                name="Target Goal (kg)"
                stroke="#6366f1"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Calorie Intake vs Target Budget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-white">Daily Caloric Adherence</h4>
            <p className="text-xs text-slate-400">Consumed vs AI Recommended Budget</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="shortDate" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" kcal" />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="calories_actual" name="Consumed (kcal)" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="calories_target"
                name="Target Calorie Budget"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Protein Target vs Actual */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm text-white">Protein Target Compliance</h4>
            <p className="text-xs text-slate-400">Myofibrillar hypertrophy protein tracking (grams)</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="proteinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="shortDate" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="g" />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="protein_actual"
                name="Protein Actual (g)"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#proteinGrad)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="protein_target"
                name="Target Protein Goal"
                stroke="#a855f7"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
