import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Layers, Search, Flame, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { dietService } from '../../services/dietService';
import { useNotification } from '../../context/NotificationContext';
import { FoodItem } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MacroBar } from '../../components/diet/MacroBar';

export const MealTrackerPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New log form state
  const [mealType, setMealType] = useState<string>('breakfast');
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const [servingSize, setServingSize] = useState<number>(1.0);
  const [foodSearch, setFoodSearch] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { showToast } = useNotification();
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, foodList] = await Promise.all([
        api.get('/tracker/daily-summary', { params: { date: todayStr } }),
        dietService.getFoodItems(),
      ]);
      setSummary(sumRes.data);
      setFoods(foodList);
      if (foodList.length > 0) setSelectedFoodId(foodList[0].id);
    } catch (e) {
      showToast('error', 'Failed to load meal tracker data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoodId) return;

    const food = foods.find((f) => f.id === selectedFoodId);
    if (!food) return;

    setIsSubmitting(true);
    try {
      await api.post('/tracker/meal', {
        logged_date: todayStr,
        meal_type: mealType,
        food_item_id: food.id,
        food_name: food.name,
        calories: roundVal(food.calories * servingSize),
        protein_g: roundVal(food.protein_g * servingSize),
        carbs_g: roundVal(food.carbs_g * servingSize),
        fat_g: roundVal(food.fat_g * servingSize),
        serving_size: servingSize,
        serving_unit: food.serving_unit,
      });

      showToast('success', `Logged ${food.name}!`);
      loadData();
    } catch (e) {
      showToast('error', 'Failed to log meal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: number) => {
    try {
      await api.delete(`/tracker/meal/${id}`);
      showToast('info', 'Meal log deleted');
      loadData();
    } catch (e) {
      showToast('error', 'Could not delete log');
    }
  };

  const roundVal = (num: number) => Math.round(num * 10) / 10;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading meal tracker..." />
      </div>
    );
  }

  const n = summary?.nutrition;
  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(foodSearch.toLowerCase())
  );
  const currentSelectedFood = foods.find((f) => f.id === selectedFoodId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Today's Meal Tracker</h2>
        </div>
        <p className="text-xs text-slate-400">
          Track daily food items, monitor consumed vs remaining calories, and sustain macro balance.
        </p>

        {/* Nutritional Progress Gauges */}
        {n && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Calories Consumed
              </span>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-white">{n.calories_consumed}</span>
                <span className="text-xs text-slate-400 font-bold">/ {n.calories_target} kcal</span>
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                {n.calories_remaining} kcal remaining
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Protein Intake
              </span>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-emerald-400">{n.protein_consumed_g}</span>
                <span className="text-xs text-slate-400 font-bold">/ {n.protein_target_g} g</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {Math.round((n.protein_consumed_g / (n.protein_target_g || 1)) * 100)}% target reached
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Carbohydrates
              </span>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-sky-400">{n.carbs_consumed_g}</span>
                <span className="text-xs text-slate-400 font-bold">/ {n.carbs_target_g} g</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {Math.round((n.carbs_consumed_g / (n.carbs_target_g || 1)) * 100)}% target reached
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Fats Intake
              </span>
              <div className="mt-1 flex items-baseline space-x-1.5">
                <span className="text-2xl font-black text-amber-400">{n.fat_consumed_g}</span>
                <span className="text-xs text-slate-400 font-bold">/ {n.fat_target_g} g</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {Math.round((n.fat_consumed_g / (n.fat_target_g || 1)) * 100)}% target reached
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Log Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Plus className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Log a Meal or Food Item</h3>
          </div>

          <form onSubmit={handleAddMeal} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Meal Slot</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snack">Snack</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Food Item</label>
              <input
                type="text"
                placeholder="Search food name..."
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
                className="w-full px-3 py-2 mb-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
              />
              <select
                value={selectedFoodId || ''}
                onChange={(e) => setSelectedFoodId(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              >
                {filteredFoods.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.calories} kcal / {f.serving_size} {f.serving_unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-300">Serving Multiplier</label>
                <span className="text-xs font-bold text-emerald-400">{servingSize}x portion</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="4.0"
                step="0.25"
                value={servingSize}
                onChange={(e) => setServingSize(parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {currentSelectedFood && (
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>{currentSelectedFood.name}</span>
                  <span className="text-emerald-400">
                    {Math.round(currentSelectedFood.calories * servingSize)} kcal
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>P: {roundVal(currentSelectedFood.protein_g * servingSize)}g</span>
                  <span>C: {roundVal(currentSelectedFood.carbs_g * servingSize)}g</span>
                  <span>F: {roundVal(currentSelectedFood.fat_g * servingSize)}g</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Meal Log</span>
            </button>
          </form>
        </div>

        {/* Today's Logged Items List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">Today's Logged Items ({summary?.meal_logs?.length || 0})</h3>
            <span className="text-xs text-slate-400">{todayStr}</span>
          </div>

          {summary?.meal_logs?.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No meals logged today yet. Use the form or Add buttons on your Diet Plan!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {summary?.meal_logs?.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {log.meal_type}
                      </span>
                      <h5 className="font-bold text-xs text-white">{log.food_name}</h5>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {log.calories} kcal • {log.protein_g}g P • {log.carbs_g}g C • {log.fat_g}g F (
                      {log.serving_size} {log.serving_unit})
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
