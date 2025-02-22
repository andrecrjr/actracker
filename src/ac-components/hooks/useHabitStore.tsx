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

console.log('>>>>>>>>> loading');

export const useHabitStore = create<HabitStoreState>()(
  persist(
    (set, get) => ({
      habits: [],

      // Inicializa os hábitos carregando da nuvem ou do localStorage
      initializeHabits: async () => {
        try {
          const cloudHabits = await getAllHabitsFromCloud();
          set({ habits: cloudHabits });
        } catch (error) {
          console.error('Erro ao carregar hábitos da nuvem:', error);
        }
      },

      // Cria um novo hábito e salva na nuvem
      createHabit: async (newHabit: Habit) => {
        set(state => ({ habits: [...state.habits, newHabit] }));
        await saveOrUpdateUniqueHabitToCloud(newHabit);
      },

      // Atualiza um hábito existente
      updateHabit: async (updatedHabit: Habit) => {
        set(state => ({
          habits: state.habits.map(h =>
            h.id === updatedHabit.id ? updatedHabit : h,
          ),
        }));
        await saveOrUpdateUniqueHabitToCloud(updatedHabit);
      },

      // Atualiza parcialmente um hábito (exemplo: plugin data)
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

      // Arquiva um hábito
      archiveHabit: async (habitId: string) => {
        set(state => {
          const updatedHabits = archiveHabitUtil(state.habits, habitId);
          return { habits: getActiveHabits(updatedHabits) };
        });

        const habitToArchive = get().habits.find(h => h.id === habitId);
        if (habitToArchive) {
          await saveOrUpdateUniqueHabitToCloud(habitToArchive);
        }
      },

      // Obtém um hábito pelo ID
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

      // Define uma lista inteira de hábitos (útil para reset ou sincronização)
      setHabits: (newHabits: Habit[]) => {
        set({ habits: newHabits });
      },
    }),
    {
      name: 'habits', // Nome da chave no localStorage
      storage: createJSONStorage(() => localStorage), // Usa localStorage como armazenamento
    },
  ),
);
