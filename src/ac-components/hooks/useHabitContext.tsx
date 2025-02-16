import {
  archiveHabit as archiveHabitUtil,
  getActiveHabits,
  getHabitsFromStorage,
  saveHabitsToStorage,
} from '@/ac-components/lib/habits';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useTransition,
} from 'react';
import { pluginManager } from '../lib/plugins';
import {
  getAllHabitsFromCloud,
  saveOrUpdateUniqueHabitToCloud,
  updateHabitDataToCloud,
} from '../service';
import { Habit, HabitContextType } from '../types/habits';
import { token } from '../utils';

// Cria o contexto com um valor padrão nulo
const HabitContext = createContext<HabitContextType | null>(null);

// Provedor do contexto
export const HabitProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isPendingHabit, startTransition] = useTransition();

  // Inicializa os hábitos ao montar o componente
  useEffect(() => {
    const initializeHabits = async () => {
      try {
        const cloudHabits = await getAllHabitsFromCloud();
        startTransition(() => {
          setHabits(cloudHabits);
          saveHabitsToStorage(cloudHabits);
        });
      } catch (error) {
        const localHabits = getHabitsFromStorage();
        startTransition(() => {
          setHabits(localHabits);
        });
      }
    };

    initializeHabits();
  }, []);

  // Função para criar um novo hábito
  const createHabit = async (newHabit: Habit) => {
    setHabits(prevHabits => {
      const updatedHabits = [...prevHabits, newHabit];
      saveHabitsToStorage(updatedHabits);
      return updatedHabits;
    });
    await saveOrUpdateUniqueHabitToCloud(newHabit);
  };

  // Função para atualizar um hábito existente
  const updateHabit = async (updatedHabit: Habit) => {
    setHabits(prevHabits => {
      const updatedHabits = prevHabits.map(h =>
        h.id === updatedHabit.id ? updatedHabit : h,
      );
      saveHabitsToStorage(updatedHabits);
      return updatedHabits;
    });
    await saveOrUpdateUniqueHabitToCloud(updatedHabit);
  };

  // Função para atualizar parcialmente um hábito
  const partialUpdateHabit = async (
    habitId: string,
    updates: Partial<Habit>,
  ) => {
    setHabits(prevHabits => {
      const updatedHabits = prevHabits.map(h =>
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
      saveHabitsToStorage(updatedHabits);
      return updatedHabits;
    });

    if (token) {
      const updatedHabit = habits.find(h => h.id === habitId);
      if (updatedHabit) {
        await updateHabitDataToCloud(updatedHabit);
      }
    }
  };

  // Função para arquivar um hábito
  const archiveHabit = async (habitId: string) => {
    setHabits(prevHabits => {
      const updatedHabits = archiveHabitUtil(prevHabits, habitId);
      saveHabitsToStorage(updatedHabits);
      return getActiveHabits(updatedHabits);
    });

    const habitToArchive = habits.find(h => h.id === habitId);
    if (habitToArchive) {
      await saveOrUpdateUniqueHabitToCloud(habitToArchive);
    }
  };

  // Função para obter um hábito pelo ID
  const getHabitById = (habitId: string): Habit | null => {
    return habits.find(h => h.id === habitId) || null;
  };

  const handleHabitToggle = async (habitId: string, date: string) => {
    setHabits(prevHabits => {
      const updatedHabits = prevHabits.map(habit => {
        if (habit.id === habitId) {
          const isDateCompleted = habit.completedDates.includes(date);
          const completedDates = isDateCompleted
            ? habit.completedDates.filter(d => d !== date)
            : [...habit.completedDates, date];

          // Execute plugin hook if the habit is being marked as complete
          if (!isDateCompleted) {
            pluginManager.executeHook('onHabitComplete', habit, date);
          }

          return { ...habit, completedDates };
        }
        return habit;
      });

      saveHabitsToStorage(updatedHabits);
      return updatedHabits;
    });
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        createHabit,
        updateHabit,
        partialUpdateHabit,
        archiveHabit,
        getHabitById,
        setHabits,
        handleHabitToggle,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

// Hook personalizado para usar o contexto de hábitos
export const useHabits = (): HabitContextType => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
