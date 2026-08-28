import React, { useEffect, useState } from 'react';
import { RefreshCw, Check, AlertCircle, Sparkles, Flame } from 'lucide-react';
import { MealPlanItem, MealReplaceAlternative } from '../../types';
import { dietService } from '../../services/dietService';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { MacroBar } from './MacroBar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mealItem: MealPlanItem | null;
  onReplacementApplied: () => void;
}

export const MealReplaceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  mealItem,
  onReplacementApplied,
}) => {
  const [alternatives, setAlternatives] = useState<MealReplaceAlternative[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && mealItem) {
      loadAlternatives();
    }
  }, [isOpen, mealItem]);

  const loadAlternatives = async () => {
    if (!mealItem) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await dietService.getAlternatives(mealItem.id);
      setAlternatives(data);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to fetch replacement options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (foodId: number) => {
    if (!mealItem) return;
    setIsApplying(true);
    try {
      await dietService.applyReplacement(mealItem.id, foodId);
      onReplacementApplied();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to apply replacement');
    } finally {
      setIsApplying(false);
    }
  };

  if (!mealItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Replace ${mealItem.meal_type.toUpperCase()}: ${mealItem.custom_name}`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Current meal summary */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
          <div>
            <span className="text-slate-400 block">Current Target Budget:</span>
            <span className="font-bold text-white text-sm">{mealItem.custom_name}</span>
          </div>
          <div className="text-right">
            <span className="font-extrabold text-emerald-400 text-sm">
              {Math.round(mealItem.calories)} kcal
            </span>
            <span className="text-slate-400 block">
              {mealItem.protein_g}g P • {mealItem.carbs_g}g C • {mealItem.fat_g}g F
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>AI-Ranked Nutritionally Compatible Alternatives</span>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/30 text-rose-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner message="Calculating macro-balanced alternatives..." />
        ) : alternatives.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">
            No suitable alternative found matching current strict dietary constraints.
          </p>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {alternatives.map((alt) => (
              <div
                key={alt.food_item.id}
                className="p-4 bg-slate-850/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition duration-200 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-sm text-white">{alt.food_item.name}</h5>
                    <span className="text-[11px] text-slate-400">
                      Portion: {alt.serving_amount} {alt.serving_unit} ({alt.food_item.category})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-400 text-sm flex items-center justify-end">
                      <Flame className="w-3.5 h-3.5 mr-1" />
                      {Math.round(alt.calories)} kcal
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Δ {Math.abs(Math.round(alt.calories - mealItem.calories))} kcal diff
                    </span>
                  </div>
                </div>

                <MacroBar
                  protein={alt.protein_g}
                  carbs={alt.carbs_g}
                  fat={alt.fat_g}
                  totalCalories={alt.calories}
                />

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400 italic max-w-xs">{alt.reason}</p>
                  <button
                    disabled={isApplying}
                    onClick={() => handleApply(alt.food_item.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1 shadow-md shadow-emerald-950"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Select This Meal</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
