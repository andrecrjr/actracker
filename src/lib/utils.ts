import {
  archiveHabit,
  getActiveHabits,
  getHabitsFromStorage,
  saveHabitsToStorage,
} from '@/lib/habits';
import type { Habit } from '@/types/habits';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get all active habits from storage
export const getAllActiveHabits = (): Habit[] => {
  const allHabits = getHabitsFromStorage();
  return getActiveHabits(allHabits);
};

// Archive a habit
export const archiveHabitById = (habitId: string): Habit[] => {
  const allHabits = getHabitsFromStorage();
  const updatedHabits = archiveHabit(allHabits, habitId);
  saveHabitsToStorage(updatedHabits);
  return getActiveHabits(updatedHabits);
};

// Create a new habit
export const createHabit = (newHabit: Habit): Habit[] => {
  const allHabits = getHabitsFromStorage();
  const updatedHabits = [...allHabits, newHabit];
  saveHabitsToStorage(updatedHabits);
  return getActiveHabits(updatedHabits);
};

// Update an existing habit
export const updateHabit = (updatedHabit: Habit): Habit[] => {
  const allHabits = getHabitsFromStorage();
  const updatedHabits = allHabits.map(habit =>
    habit.id === updatedHabit.id ? updatedHabit : habit,
  );
  saveHabitsToStorage(updatedHabits);
  return getActiveHabits(updatedHabits);
};

// Partially update a habit (e.g., plugin data or specific fields)
export const updateHabitPartial = (
  habitId: string,
  updates: Partial<Habit>,
): Habit[] => {
  const allHabits = getHabitsFromStorage();
  const updatedHabits = allHabits.map(habit =>
    habit.id === habitId
      ? {
          ...habit,
          ...updates,
          pluginData: {
            ...habit.pluginData,
            ...(updates.pluginData || {}),
          },
        }
      : habit,
  );
  saveHabitsToStorage(updatedHabits);
  return getActiveHabits(updatedHabits);
};
