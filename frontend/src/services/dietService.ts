import { api } from './api';
import { MealPlan, FoodItem, MealReplaceAlternative } from '../types';

export const dietService = {
  getMealPlan: async (date?: string): Promise<MealPlan> => {
    const params = date ? { date } : {};
    const response = await api.get<MealPlan>('/diet/plan', { params });
    return response.data;
  },

  regenerateMealPlan: async (date?: string): Promise<MealPlan> => {
    const params = date ? { date } : {};
    const response = await api.post<MealPlan>('/diet/generate', {}, { params });
    return response.data;
  },

  getFoodItems: async (category?: string, query?: string): Promise<FoodItem[]> => {
    const params: any = {};
    if (category) params.category = category;
    if (query) params.query = query;
    const response = await api.get<FoodItem[]>('/diet/foods', { params });
    return response.data;
  },

  getAlternatives: async (itemId: number): Promise<MealReplaceAlternative[]> => {
    const response = await api.get<MealReplaceAlternative[]>(`/diet/replace/alternatives/${itemId}`);
    return response.data;
  },

  applyReplacement: async (itemId: number, foodId: number) => {
    const response = await api.post(`/diet/replace/apply/${itemId}/${foodId}`);
    return response.data;
  }
};
