import { api } from './api';

export const expertService = {
  getDashboard: async () => {
    const response = await api.get('/expert/dashboard');
    return response.data;
  },

  getUserDetails: async (userId: number) => {
    const response = await api.get(`/expert/user/${userId}`);
    return response.data;
  },

  addExpertNote: async (data: {
    user_id: number;
    title: string;
    message: string;
    recommendation_type?: string;
    calorie_adjustment?: number;
  }) => {
    const response = await api.post('/expert/user/note', data);
    return response.data;
  }
};
