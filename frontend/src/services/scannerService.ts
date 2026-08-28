import { api } from './api';
import { FoodScanResult } from '../types';

export const scannerService = {
  scanFoodImage: async (imageFile: File): Promise<FoodScanResult> => {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await api.post<FoodScanResult>('/food-scanner/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  logScannedMeal: async (mealData: {
    logged_date: string;
    meal_type: string;
    food_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    serving_size: number;
    serving_unit: string;
  }) => {
    const response = await api.post('/tracker/meal', mealData);
    return response.data;
  }
};
