import {
  archiveHabit as archiveHabitUtil,
  getActiveHabits,
} from '@/ac-components/lib/habits';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { pluginManager } from '../lib/plugins';
import {
  getAllHabitsFromCloud,
  saveOrUpdateUniqueHabitToCloud,
} from '../service';
import { Habit } from '../types/habits';

type HabitStoreState = {
  habits: Habit[];
  initializeHabits: () => Promise<void>;
  createHabit: (newHabit: Habit) => Promise<void>;
  updateHabit: (updatedHabit: Habit) => Promise<void>;
  partialUpdateHabit: (
    habitId: string,
    updates: Partial<Habit>,
  ) => Promise<void>;
  archiveHabit: (habitId: string) => Promise<void>;
  getHabitById: (habitId: string) => Habit | null;
  handleHabitToggle: (habitId: string, date: string) => Promise<void>;
  setHabits: (newHabits: Habit[]) => void;
};

export const useHabitStore = create<HabitStoreState>()(
  persist(
    (set, get) => ({
      habits: [],

      initializeHabits: async () => {
        try {
          const cloudHabits = await getAllHabitsFromCloud();
          set({ habits: cloudHabits });
        } catch (error) {
          console.error('Erro ao carregar hábitos da nuvem:', error);
        }
      },

      createHabit: async (newHabit: Habit) => {
        set(state => ({ habits: [...state.habits, newHabit] }));
        await saveOrUpdateUniqueHabitToCloud(newHabit);
      },

      updateHabit: async (updatedHabit: Habit) => {
        set(state => ({
          habits: state.habits.map(h =>
            h.id === updatedHabit.id ? updatedHabit : h,
          ),
        }));
        await saveOrUpdateUniqueHabitToCloud(updatedHabit);
      },

      partialUpdateHabit: async (habitId: string, updates: Partial<Habit>) => {
        set(state => ({
          habits: state.habits.map(h =>
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
          ),
        }));

        const updatedHabit = get().habits.find(h => h.id === habitId);
        if (updatedHabit) {
          await saveOrUpdateUniqueHabitToCloud(updatedHabit);
        }
      },

      archiveHabit: async (habitId: string) => {
        set(state => {
          const updatedHabits = archiveHabitUtil(state.habits, habitId);
          return { habits: updatedHabits };
        });

        const habitToArchive = get().habits.find(h => h.id === habitId);
        if (habitToArchive) {
          await saveOrUpdateUniqueHabitToCloud(habitToArchive);
        }
      },

      getHabitById: (habitId: string) => {
        return get().habits.find(h => h.id === habitId) || null;
      },

      handleHabitToggle: async (habitId: string, date: string) => {
        set(state => ({
          habits: state.habits.map(habit => {
            if (habit.id === habitId) {
              const isDateCompleted = habit.completedDates.includes(date);
              const completedDates = isDateCompleted
                ? habit.completedDates.filter(d => d !== date)
                : [...habit.completedDates, date];

              if (!isDateCompleted) {
                pluginManager.executeHook('onHabitComplete', habit, date);
              }

              return { ...habit, completedDates };
            }
            return habit;
          }),
        }));
      },

      setHabits: (newHabits: Habit[]) => {
        set({ habits: newHabits });
      },
    }),
    {
      name: 'habits',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
