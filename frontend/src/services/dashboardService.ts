import { api } from './api';
import { DashboardData } from '../types';

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/dashboard/');
    return response.data;
  },
};
