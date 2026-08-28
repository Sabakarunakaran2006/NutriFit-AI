import React from 'react';

interface Props {
  protein: number;
  carbs: number;
  fat: number;
  totalCalories?: number;
}

export const MacroBar: React.FC<Props> = ({ protein, carbs, fat, totalCalories }) => {
  const pCals = protein * 4;
  const cCals = carbs * 4;
  const fCals = fat * 9;
  const total = pCals + cCals + fCals || 1;

  const pPct = Math.round((pCals / total) * 100);
  const cPct = Math.round((cCals / total) * 100);
  const fPct = Math.round((fCals / total) * 100);

  return (
    <div className="space-y-1.5">
      <div className="w-full h-2 rounded-full overflow-hidden bg-slate-800 flex">
        <div
          style={{ width: `${pPct}%` }}
          className="bg-emerald-500 transition-all duration-300"
          title={`Protein: ${protein}g (${pPct}%)`}
        />
        <div
          style={{ width: `${cPct}%` }}
          className="bg-sky-500 transition-all duration-300"
          title={`Carbs: ${carbs}g (${cPct}%)`}
        />
        <div
          style={{ width: `${fPct}%` }}
          className="bg-amber-500 transition-all duration-300"
          title={`Fat: ${fat}g (${fPct}%)`}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>P: {protein}g ({pPct}%)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
          <span>C: {carbs}g ({cPct}%)</span>
        </span>
        <span className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <span>F: {fat}g ({fPct}%)</span>
        </span>
      </div>
    </div>
  );
};
