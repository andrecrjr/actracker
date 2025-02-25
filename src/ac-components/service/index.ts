import { getHabitsFromStorage } from '../lib/habits';
import { Habit } from '../types';
import { token } from '../utils';
import axiosInstance from '../utils/axios';

export const getAllHabitsFromCloud = async (): Promise<Habit[]> => {
  try {
    const response = await axiosInstance.get<{ habits: Habit[] }>('/habit');
    console.log(response.data.habits);
    return response.data.habits;
  } catch (error) {
    return [];
  }
};

export const saveOrUpdateUniqueHabitToCloud = async (newHabit: Habit) => {
  try {
    await axiosInstance.post('/habit', {
      habitData: newHabit,
    });
    return true;
  } catch (error) {
    return;
  }
};

export const updateHabitDataToCloud = async (habitData: Habit) => {
  try {
    await axiosInstance.put('/habit', {
      habitId: habitData.id,
      habitData: habitData,
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const saveSyncCloud = async (habitData: Habit[]) => {
  try {
    if (!token) {
      return;
    }
    await axiosInstance.post('/habit/sync', {
      habits: habitData,
    });
    return true;
  } catch (error) {
    return;
  }
};
