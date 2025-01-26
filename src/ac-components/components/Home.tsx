import { DailyHabitList } from '@/ac-components/components/DailyHabitList';
import { DayNavigation } from '@/ac-components/components/DayNavigation';
import { HabitForm } from '@/ac-components/components/HabitForm';
import { Button } from '@/ac-components/components/ui';
import {
  getHabitsFromStorage,
  saveHabitsToStorage,
} from '@/ac-components/lib/habits';
import { pluginManager } from '@/ac-components/lib/plugins';
import type { Habit } from '@/ac-components/types/habits';
import { useNavigate } from '@modern-js/runtime/router';
import { Calendar, Settings } from 'lucide-react';

import { useEffect, useState } from 'react';
import { HabitCalendar } from './CalendarMode';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState(false);
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
  };

  const handleHabitToggle = async (habitId: string, date: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const completedDates = habit.completedDates.includes(date)
          ? habit.completedDates.filter(d => d !== date)
          : [...habit.completedDates, date];

        if (!habit.completedDates.includes(date)) {
          // Execute the onHabitComplete hook when marking as complete
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            AC Tracker
          </h1>
          <Button
            variant="outline"
            size="icon"
            className="ml-auto"
            onClick={() => {
              setCalendarMode(!calendarMode);
              localStorage.setItem(
                'calendarMode',
                JSON.stringify(!calendarMode),
              );
            }}
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => router('/habits')}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <div className="mb-4">
          <HabitForm onSave={handleHabitCreate} currentDate={currentDate} />
        </div>
        <section className={`contents ${calendarMode ? 'hidden' : ''}`}>
          <DayNavigation
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
          <DailyHabitList
            habits={habits}
            currentDate={currentDate}
            onToggle={handleHabitToggle}
          />
        </section>
        <section className={`contents ${!calendarMode ? 'hidden' : ''}`}>
          <HabitCalendar
            currentDate={currentDate}
            habits={habits}
            onDateSelect={date => setCurrentDate(date)}
            onToggle={handleHabitToggle}
          />
        </section>
      </div>
    </div>
  );
}
