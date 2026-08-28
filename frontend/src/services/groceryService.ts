import { api } from './api';
import { GroceryListResponse } from '../types';

export const groceryService = {
  getGroceryList: async (days: number = 7): Promise<GroceryListResponse> => {
    const response = await api.get<GroceryListResponse>('/grocery/', { params: { days } });
    return response.data;
  },
};
