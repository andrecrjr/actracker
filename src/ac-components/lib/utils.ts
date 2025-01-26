import {
  archiveHabit,
  getActiveHabits,
  getHabitsFromStorage,
  saveHabitsToStorage,
} from '@/ac-components/lib/habits';
import type { Habit } from '@/ac-components/types/habits';
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

// Date calculation utilities
export function getMonthWeeks(date: Date): Date[][] {
  const weeks: Date[][] = [];
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  let currentDate = new Date(firstDay);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay());

  while (currentDate <= lastDay || weeks.length < 6) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    weeks.push(week);
    if (currentDate > lastDay && currentDate.getMonth() !== date.getMonth())
      break;
  }

  return weeks;
}

export function getWeekDays(date: Date): Date[] {
  const days = [];
  const dayOfWeek = date.getDay();
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    days.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }
  return days;
}

export * from './date-utils';
