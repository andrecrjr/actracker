import React from 'react';

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  startDate: string;
  endDate?: string;
  completedDates: string[];
  daysOfWeek?: number[]; // For weekly habits
  specificDayOfMonth?: number | null; // For monthly habits
  repeatMonthly?: boolean; // For monthly habits
  archived?: boolean;
  archiveDate?: string;
  hidden?: boolean;
  plugins?: PluginHabit[];
  pluginData?: Record<string, any>; // Serialized plugin content
  cloudSync?: boolean;
}

export interface PluginHabit {
  id: string;
  enabled: boolean;
  settings?: Record<string, any>;
}

export interface HabitContextType {
  habits: Habit[];
  createHabit: (newHabit: Habit) => Promise<void>;
  updateHabit: (updatedHabit: Habit) => Promise<void>;
  partialUpdateHabit: (
    habitId: string,
    updates: Partial<Habit>,
  ) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;
  getHabitById: (habitId: string) => Habit | null;
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  handleHabitToggle: (habitId: string, date: string) => Promise<void>;
}
