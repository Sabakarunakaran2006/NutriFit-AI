import React, { useEffect, useState } from 'react';
import { RefreshCw, Utensils, Sparkles, Plus, Flame, Search } from 'lucide-react';
import { dietService } from '../../services/dietService';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { MealPlan, MealPlanItem, FoodItem } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { MealCard } from '../../components/diet/MealCard';
import { MealReplaceModal } from '../../components/diet/MealReplaceModal';
import { MacroBar } from '../../components/diet/MacroBar';

export const DietPlanPage: React.FC = () => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState<boolean>(false);
  const [selectedItemForReplace, setSelectedItemForReplace] = useState<MealPlanItem | null>(null);

  const { showToast } = useNotification();

  useEffect(() => {
    loadDietData();
  }, []);

  const loadDietData = async () => {
    setIsLoading(true);
    try {
      const [plan, allFoods] = await Promise.all([
        dietService.getMealPlan(),
        dietService.getFoodItems(),
      ]);
      setMealPlan(plan);
      setFoods(allFoods);
    } catch (e) {
      showToast('error', 'Failed to load diet plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newPlan = await dietService.regenerateMealPlan();
      setMealPlan(newPlan);
      showToast('success', 'New personalized meal plan generated!');
    } catch (e) {
      showToast('error', 'Failed to regenerate plan');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAddToTracker = async (meal: MealPlanItem) => {
    try {
      await api.post('/tracker/meal', {
        logged_date: new Date().toISOString().split('T')[0],
        meal_type: meal.meal_type,
        food_item_id: meal.food_item_id,
        food_name: meal.custom_name,
        calories: meal.calories,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        serving_size: meal.serving_amount,
        serving_unit: meal.serving_unit,
      });
      showToast('success', `Added ${meal.custom_name} to today's log!`);
    } catch (e) {
      showToast('error', 'Failed to log meal');
    }
  };

  const filteredFoods = foods.filter((f) => {
    const matchCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchQ = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQ;
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading personalized nutrition plan..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Constraint-Satisfaction Meal Generator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Personalized Daily Nutrition Plan
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {mealPlan?.explanation || 'Calibrated to your exact metabolic requirements and dietary restrictions.'}
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg shadow-emerald-950 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span>Regenerate Meal Split</span>
        </button>
      </div>

      {/* Target Totals Card */}
      {mealPlan && (
        <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Daily Macro Budget Summary
              </span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-black text-white">
                  {Math.round(mealPlan.total_calories)}
                </span>
                <span className="text-sm font-bold text-slate-400">kcal total</span>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <span className="block text-xs text-slate-400">Protein</span>
                <span className="font-extrabold text-emerald-400">{mealPlan.total_protein}g</span>
              </div>
              <div className="text-center">
                <span className="block text-xs text-slate-400">Carbs</span>
                <span className="font-extrabold text-sky-400">{mealPlan.total_carbs}g</span>
              </div>
              <div className="text-center">
                <span className="block text-xs text-slate-400">Fats</span>
                <span className="font-extrabold text-amber-400">{mealPlan.total_fat}g</span>
              </div>
            </div>
          </div>

          <MacroBar
            protein={mealPlan.total_protein}
            carbs={mealPlan.total_carbs}
            fat={mealPlan.total_fat}
            totalCalories={mealPlan.total_calories}
          />
        </div>
      )}

      {/* 4 Daily Meal Cards */}
      {mealPlan && (
        <div className="space-y-3">
          <h3 className="text-base font-bold text-white tracking-tight">Today's Meal Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealPlan.items.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onReplaceClick={(m) => {
                  setSelectedItemForReplace(m);
                  setReplaceModalOpen(true);
                }}
                onAddToTracker={handleAddToTracker}
              />
            ))}
          </div>
        </div>
      )}

      {/* Food Database Explorer */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-base text-white">Food & Nutrient Catalog</h4>
            <p className="text-xs text-slate-400">Explore verified foods and portion density</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search food item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="protein">Proteins</option>
              <option value="grains">Grains</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="healthy_fats">Healthy Fats</option>
              <option value="dairy">Dairy</option>
              <option value="snacks">Snacks</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {food.category}
                </span>
                <h5 className="font-bold text-xs text-white mt-1.5">{food.name}</h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {food.calories} kcal / {food.serving_size} {food.serving_unit}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                <span>P: {food.protein_g}g</span>
                <span>C: {food.carbs_g}g</span>
                <span>F: {food.fat_g}g</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Replace Modal */}
      <MealReplaceModal
        isOpen={replaceModalOpen}
        onClose={() => setReplaceModalOpen(false)}
        mealItem={selectedItemForReplace}
        onReplacementApplied={() => {
          showToast('success', 'Meal replaced with macro parity!');
          loadDietData();
        }}
      />
    </div>
  );
};
