import { DailyHabitList } from '@/ac-components/components/DailyHabitList';
import { DayNavigation } from '@/ac-components/components/DayNavigation';
import { HabitForm } from '@/ac-components/components/HabitFormComponent';
import { useNavigate } from '@modern-js/runtime/router';
import { Calendar, Home as HomeIcon, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth, useHabitStore, useHabits } from '../hooks';
import { HabitCalendar } from './CalendarMode';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState(false);
  const { habits, createHabit, handleHabitToggle, initializeHabits } =
    useHabitStore();
  const { isAuthenticated } = useAuth();
  const router = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      initializeHabits();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setCalendarMode(JSON.parse(localStorage.getItem('calendarMode')! ?? false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <div className="container mx-auto px-2 py-4 pb-16 max-w-3xl flex-1">
        <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 text-left mb-2">
          AC Tracker
        </h1>
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
          <span className="text-xs">Daily</span>
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

        <section className="flex flex-col items-center text-gray-600">
          <HabitForm onSave={createHabit} currentDate={currentDate} />
        </section>
      </footer>
    </div>
  );
}
