import React, { useEffect, useState } from 'react';
import { ShoppingCart, Check, Plus, Trash2, Printer, Download, Sparkles } from 'lucide-react';
import { groceryService } from '../../services/groceryService';
import { useNotification } from '../../context/NotificationContext';
import { GroceryCategory } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const GroceryListPage: React.FC = () => {
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [daysCovered, setDaysCovered] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // New item modal/form
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemAmount, setNewItemAmount] = useState<number>(100);
  const [newItemUnit, setNewItemUnit] = useState<string>('g');
  const [newItemCategory, setNewItemCategory] = useState<string>('Proteins & Meats');

  const { showToast } = useNotification();

  useEffect(() => {
    loadGroceryList();
  }, [daysCovered]);

  const loadGroceryList = async () => {
    setIsLoading(true);
    try {
      const data = await groceryService.getGroceryList(daysCovered);
      setCategories(data.categories);
      setTotalItems(data.total_items);
    } catch (e) {
      showToast('error', 'Failed to generate grocery list');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItemCheck = (catIndex: number, itemIndex: number) => {
    setCategories((prev) => {
      const next = [...prev];
      next[catIndex].items[itemIndex].checked = !next[catIndex].items[itemIndex].checked;
      return next;
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setCategories((prev) => {
      const next = [...prev];
      let cat = next.find((c) => c.category_name === newItemCategory);
      if (!cat) {
        cat = { category_name: newItemCategory, items: [] };
        next.push(cat);
      }
      cat.items.push({
        name: newItemName.trim(),
        quantity: newItemAmount,
        unit: newItemUnit,
        checked: false,
      });
      return next;
    });

    setTotalItems((prev) => prev + 1);
    setNewItemName('');
    showToast('success', 'Custom grocery item added!');
  };

  const handleRemoveItem = (catIndex: number, itemIndex: number) => {
    setCategories((prev) => {
      const next = [...prev];
      next[catIndex].items.splice(itemIndex, 1);
      return next.filter((c) => c.items.length > 0);
    });
    setTotalItems((prev) => Math.max(0, prev - 1));
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Aggregating meal plan ingredients into shopping list..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Automated Meal Ingredient Aggregator</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Weekly Smart Grocery List</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Automatically compiled from your active meal plan and scheduled portion requirements.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print List</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categorized Grocery Checklist */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map((cat, catIdx) => (
            <div
              key={cat.category_name}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-extrabold text-sm text-emerald-400 flex items-center space-x-2">
                  <span>{cat.category_name}</span>
                </h4>
                <span className="text-xs text-slate-500 font-semibold">{cat.items.length} items</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={`${item.name}-${itemIdx}`}
                    onClick={() => toggleItemCheck(catIdx, itemIdx)}
                    className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      item.checked
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                          item.checked
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          item.checked ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-400">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(catIdx, itemIdx);
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add custom item form */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 h-fit sticky top-24">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <Plus className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Add Custom Item</h3>
          </div>

          <form onSubmit={handleAddItem} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Item Name</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Extra Olive Oil"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                <input
                  type="text"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  placeholder="g, ml, count"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category Group</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="Proteins & Meats">Proteins & Meats</option>
                <option value="Grains & Carbohydrates">Grains & Carbohydrates</option>
                <option value="Fresh Vegetables & Greens">Fresh Vegetables & Greens</option>
                <option value="Fresh Fruits">Fresh Fruits</option>
                <option value="Dairy & Alternatives">Dairy & Alternatives</option>
                <option value="Healthy Fats & Nuts">Healthy Fats & Nuts</option>
                <option value="Snacks & Condiments">Snacks & Condiments</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Grocery List</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
