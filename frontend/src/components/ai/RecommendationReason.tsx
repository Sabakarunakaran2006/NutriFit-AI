import React from 'react';
import { Sparkles, Info } from 'lucide-react';

interface Props {
  reason: string;
  badgeText?: string;
  compact?: boolean;
}

export const RecommendationReason: React.FC<Props> = ({
  reason,
  badgeText = 'AI Rationale',
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex items-start space-x-1.5 text-xs text-slate-300 bg-emerald-950/40 border border-emerald-500/20 rounded-lg p-2 mt-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <span className="leading-tight text-[11px]">{reason}</span>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-gradient-to-r from-emerald-950/50 to-slate-900 border border-emerald-500/20 rounded-xl flex items-start space-x-3 my-2">
      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold uppercase tracking-wider text-emerald-400 text-[10px]">
            {badgeText}
          </span>
          <span className="text-[10px] text-slate-400">• Explainable AI Model</span>
        </div>
        <p className="text-slate-200 leading-relaxed text-xs">{reason}</p>
      </div>
    </div>
  );
};
