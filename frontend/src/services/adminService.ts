import { api } from './api';
import { SystemOverviewStats, MLModelInfo } from '../types';

export const adminService = {
  getOverview: async (): Promise<SystemOverviewStats> => {
    const response = await api.get<SystemOverviewStats>('/admin/overview');
    return response.data;
  },

  getUsers: async (role?: string, search?: string) => {
    const params: any = {};
    if (role) params.role = role;
    if (search) params.search = search;
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId: number, isActive: boolean) => {
    const response = await api.put('/admin/users/status', {
      user_id: userId,
      is_active: isActive
    });
    return response.data;
  },

  updateUserRole: async (userId: number, role: string) => {
    const response = await api.put('/admin/users/role', {
      user_id: userId,
      role
    });
    return response.data;
  },

  assignExpert: async (expertId: number, userId: number, notes?: string) => {
    const response = await api.post('/admin/expert/assign', {
      expert_id: expertId,
      user_id: userId,
      notes
    });
    return response.data;
  },

  getMLModels: async (): Promise<MLModelInfo[]> => {
    const response = await api.get<MLModelInfo[]>('/admin/models');
    return response.data;
  },

  retrainModels: async () => {
    const response = await api.post('/admin/models/retrain');
    return response.data;
  },

  getDatasets: async () => {
    const response = await api.get('/admin/datasets');
    return response.data;
  }
};
