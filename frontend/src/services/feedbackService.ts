import { api } from './api';
import { FeedbackData, Recommendation } from '../types';

export const feedbackService = {
  submitFeedback: async (feedback: FeedbackData) => {
    const response = await api.post('/feedback/', feedback);
    return response.data;
  },

  getFeedbackHistory: async () => {
    const response = await api.get('/feedback/history');
    return response.data;
  },

  getRecommendations: async (): Promise<Recommendation[]> => {
    const response = await api.get<Recommendation[]>('/feedback/recommendations');
    return response.data;
  }
};
