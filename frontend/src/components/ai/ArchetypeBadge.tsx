import React from 'react';
import { Target, Zap, Dumbbell, Activity, Flame } from 'lucide-react';

interface Props {
  archetype: string;
  className?: string;
}

export const ArchetypeBadge: React.FC<Props> = ({ archetype, className = '' }) => {
  const getIcon = () => {
    switch (archetype) {
      case 'Lean Muscle Gain':
        return <Dumbbell className="w-4 h-4 text-indigo-400" />;
      case 'Fat Loss Accelerator':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'Strength & Power Builder':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'Endurance Athlete':
        return <Activity className="w-4 h-4 text-sky-400" />;
      default:
        return <Target className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getStyle = () => {
    switch (archetype) {
      case 'Lean Muscle Gain':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300';
      case 'Fat Loss Accelerator':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-300';
      case 'Strength & Power Builder':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-300';
      case 'Endurance Athlete':
        return 'bg-sky-500/10 border-sky-500/20 text-sky-300';
      default:
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
    }
  };

  return (
    <div
      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-xl border text-xs font-bold tracking-wide shadow-sm ${getStyle()} ${className}`}
    >
      {getIcon()}
      <span>{archetype}</span>
      <span className="text-[10px] opacity-70 border-l border-current pl-1.5 ml-1">K-Means Cluster</span>
    </div>
  );
};
