import { api } from './api';
import { ProgressSummary } from '../types';

export const progressService = {
  getProgressSummary: async (days: number = 30): Promise<ProgressSummary> => {
    const response = await api.get<ProgressSummary>('/progress/', { params: { days } });
    return response.data;
  },

  logProgress: async (data: {
    logged_date: string;
    weight_kg: number;
    calories_consumed?: number;
    protein_consumed?: number;
    water_liters?: number;
    sleep_hours?: number;
    energy_level?: number;
    notes?: string;
  }) => {
    const response = await api.post('/progress/', data);
    return response.data;
  }
};
