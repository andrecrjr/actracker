import {
  archiveHabit,
  getActiveHabits,
  getHabitsFromStorage,
  saveHabitsToStorage,
} from '@/lib/habits';
import type { Habit } from '@/types/habits';

import React, { useEffect, useState } from 'react';

export const useHabitStore = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [, setHabitToArchive] = useState<Habit | null>(null);
  const [, setHabitToEdit] = useState<Habit | null>(null);

  const handleArchiveHabit = (habit: Habit) => {
    const allHabits = getHabitsFromStorage();
    const updatedHabits = archiveHabit(allHabits, habit.id);
    saveHabitsToStorage(updatedHabits);
    setHabits(getActiveHabits(updatedHabits));
    setHabitToArchive(null);
  };

  const handleHabitCreate = (newHabit: Habit) => {
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    saveHabitsToStorage(updatedHabits);
  };

  const handleHabitUpdate = (updatedHabit: Habit) => {
    const updatedHabits = habits.map(h =>
      h.id === updatedHabit.id ? updatedHabit : h,
    );
    setHabits(updatedHabits);
    saveHabitsToStorage(updatedHabits);
    setHabitToEdit(null);
  };

  const getCurrentHabitById = (habitId: string) => {
    const allHabits = getHabitsFromStorage();
    const habit = allHabits.find(h => h.id === habitId);
    return habit;
  };

  // New: Update specific fields or plugin data
  const handleHabitPartialUpdate = (habitId: string, updates: any) => {
    const allHabits = getHabitsFromStorage();
    const updatedHabits = allHabits.map(h =>
      h.id === habitId
        ? {
            ...h,
            ...updates,
            pluginData: {
              ...h.pluginData,
              ...(updates.pluginData || {}),
            },
          }
        : h,
    );
    setHabits(updatedHabits);
    saveHabitsToStorage(updatedHabits);
  };

  return {
    handleHabitUpdate,
    handleHabitPartialUpdate, // Added partial update
    handleHabitCreate,
    handleArchiveHabit,
    getCurrentHabitById,
    habits,
  };
};
