import React from 'react';
import { RefreshCw, Plus, Clock, Flame } from 'lucide-react';
import { MealPlanItem } from '../../types';
import { MacroBar } from './MacroBar';
import { RecommendationReason } from '../ai/RecommendationReason';

interface Props {
  meal: MealPlanItem;
  onReplaceClick: (meal: MealPlanItem) => void;
  onAddToTracker: (meal: MealPlanItem) => void;
}

export const MealCard: React.FC<Props> = ({ meal, onReplaceClick, onAddToTracker }) => {
  const getSlotColor = () => {
    switch (meal.meal_type) {
      case 'breakfast':
        return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
      case 'lunch':
        return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
      case 'snack':
        return 'border-sky-500/30 text-sky-400 bg-sky-500/10';
      case 'dinner':
        return 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10';
      default:
        return 'border-slate-700 text-slate-300 bg-slate-800';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm transition duration-300 hover:border-slate-700 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${getSlotColor()}`}
            >
              {meal.meal_type}
            </span>
            <span className="flex items-center text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {meal.meal_time}
            </span>
          </div>

          <div className="flex items-center text-emerald-400 font-extrabold text-sm">
            <Flame className="w-4 h-4 mr-1 text-emerald-500" />
            <span>{Math.round(meal.calories)} kcal</span>
          </div>
        </div>

        {/* Food Name & Serving */}
        <div className="mb-4">
          <h4 className="font-bold text-white text-base leading-snug">{meal.custom_name}</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Portion: {meal.serving_amount} {meal.serving_unit}
          </p>
        </div>

        {/* Macro breakdown */}
        <div className="mb-4">
          <MacroBar
            protein={meal.protein_g}
            carbs={meal.carbs_g}
            fat={meal.fat_g}
            totalCalories={meal.calories}
          />
        </div>

        {/* AI Explanation */}
        {meal.reason && <RecommendationReason reason={meal.reason} compact />}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center space-x-2">
        <button
          onClick={() => onReplaceClick(meal)}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Replace Meal</span>
        </button>

        <button
          onClick={() => onAddToTracker(meal)}
          className="flex-1 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add to Log</span>
        </button>
      </div>
    </div>
  );
};
