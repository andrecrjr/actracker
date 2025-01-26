import type { Habit } from '@/ac-components/types/habits';

export function generateHabitId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export interface HabitOrder {
  [date: string]: string[]; // date -> array of habit IDs in order
}

export function getHabitsFromStorage(): Habit[] {
  if (typeof window === 'undefined') return [];
  const habits = localStorage.getItem('habits');
  return habits ? JSON.parse(habits) : [];
}

export function getHabitOrderFromStorage(): HabitOrder {
  if (typeof window === 'undefined') return {};
  const order = localStorage.getItem('habitOrder');
  return order ? JSON.parse(order) : {};
}

export function saveHabitsToStorage(habits: Habit[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('habits', JSON.stringify(habits));
}

export function saveHabitOrderToStorage(order: HabitOrder): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('habitOrder', JSON.stringify(order));
}

export function archiveHabit(habits: Habit[], habitId: string): Habit[] {
  const today = new Date().toISOString().split('T')[0];

  return habits.map(habit => {
    if (habit.id !== habitId) return habit;
    return {
      ...habit,
      archived: true,
      archiveDate: today,
    };
  });
}

export function getActiveHabits(habits: Habit[]): Habit[] {
  return habits.filter(habit => !habit.archived);
}

export function getActiveListHabits(): Habit[] {
  const habits = getHabitsFromStorage();
  return habits.filter(habit => !habit.archived);
}

export function getArchivedHabits(habits: Habit[]): Habit[] {
  return habits.filter(habit => habit.archived);
}
