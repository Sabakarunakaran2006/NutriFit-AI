import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Recommendation } from '../../types';

interface Props {
  recommendation: Recommendation;
}

export const AIInsightCard: React.FC<Props> = ({ recommendation }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {recommendation.type} Insight
          </span>
          <span className="text-[10px] text-slate-500">
            {new Date(recommendation.created_at).toLocaleDateString()}
          </span>
        </div>
        <h4 className="font-bold text-sm text-white mb-1.5">{recommendation.title}</h4>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">{recommendation.message}</p>
      </div>

      <div className="pt-2 border-t border-slate-800/80 mt-auto">
        <div className="flex items-start space-x-1.5 text-[11px] text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{recommendation.reason}</span>
        </div>
      </div>
    </div>
  );
};
