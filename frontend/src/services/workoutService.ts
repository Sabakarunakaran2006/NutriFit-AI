import { api } from './api';
import { WorkoutPlan } from '../types';

export const workoutService = {
  getWorkoutPlan: async (): Promise<WorkoutPlan> => {
    const response = await api.get<WorkoutPlan>('/workout/plan');
    return response.data;
  },

  regenerateWorkoutPlan: async (): Promise<WorkoutPlan> => {
    const response = await api.post<WorkoutPlan>('/workout/generate');
    return response.data;
  },

  toggleExercise: async (exerciseId: number, completed: boolean) => {
    const response = await api.post('/workout/toggle-exercise', {
      exercise_id: exerciseId,
      completed
    });
    return response.data;
  },

  completeWorkout: async (data: {
    logged_date: string;
    workout_name: string;
    duration_mins: number;
    calories_burned: number;
    difficulty_rating: string;
    notes?: string;
  }) => {
    const response = await api.post('/workout/complete', data);
    return response.data;
  }
};
