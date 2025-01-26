import { DailyHabitList } from '@/ac-components/components/DailyHabitList';
import { DayNavigation } from '@/ac-components/components/DayNavigation';
import { HabitForm } from '@/ac-components/components/HabitForm';
import {
  getHabitsFromStorage,
  saveHabitsToStorage,
} from '@/ac-components/lib/habits';
import { pluginManager } from '@/ac-components/lib/plugins';
import type { Habit } from '@/ac-components/types/habits';
import { useNavigate } from '@modern-js/runtime/router';
import { Calendar, Home as HomeIcon, PlusCircle, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { HabitCalendar } from './CalendarMode';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState(false);
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const router = useNavigate();

  useEffect(() => {
    setHabits(getHabitsFromStorage());
  }, []);

  useEffect(() => {
    setCalendarMode(JSON.parse(localStorage.getItem('calendarMode')! ?? false));
  }, []);

  const handleHabitCreate = (newHabit: Habit) => {
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    saveHabitsToStorage(updatedHabits);
    setIsHabitFormOpen(false);
  };

  const handleHabitToggle = async (habitId: string, date: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const completedDates = habit.completedDates.includes(date)
          ? habit.completedDates.filter(d => d !== date)
          : [...habit.completedDates, date];
        if (!habit.completedDates.includes(date)) {
          pluginManager.executeHook('onHabitComplete', habit, date);
        }
        return { ...habit, completedDates };
      }
      return habit;
    });
    setHabits(updatedHabits);
    saveHabitsToStorage(updatedHabits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <div className="container mx-auto px-2 py-8 max-w-2xl flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 text-center mb-4">
          AC Tracker
        </h1>

        {isHabitFormOpen && (
          <div className="mb-4">
            <HabitForm onSave={handleHabitCreate} currentDate={currentDate} />
          </div>
        )}

        {!calendarMode ? (
          <>
            <DayNavigation
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
            <DailyHabitList
              habits={habits}
              currentDate={currentDate}
              onToggle={handleHabitToggle}
            />
          </>
        ) : (
          <HabitCalendar
            currentDate={currentDate}
            habits={habits}
            onDateSelect={date => setCurrentDate(date)}
            onToggle={handleHabitToggle}
          />
        )}
      </div>

      {/* Sticky Footer Menu */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg flex justify-around py-2">
        <button
          className="flex flex-col items-center text-gray-600"
          onClick={() => {
            setCalendarMode(false);
          }}
        >
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </button>
        <button
          className="flex flex-col items-center text-gray-600"
          onClick={() => {
            setCalendarMode(true);
          }}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-xs">Calendar</span>
        </button>
        <button
          className="flex flex-col items-center text-gray-600"
          onClick={() => router('/habits')}
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs">Settings</span>
        </button>

        <button className="flex flex-col items-center text-gray-600">
          <HabitForm onSave={handleHabitCreate} currentDate={currentDate} />
        </button>
      </footer>
    </div>
  );
}
