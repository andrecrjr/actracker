'use client';
import { usePluginContent } from '@/ac-components/hooks/usePluginContent';
import { formatDate, formatDisplayDate } from '@/ac-components/lib/date-utils';
import { pluginManager } from '@/ac-components/lib/plugins';
import { isHabitActiveForDate } from '@/ac-components/lib/streak-utils';
import { cn } from '@/ac-components/lib/utils';
import { getMonthWeeks, getWeekDays } from '@/ac-components/lib/utils';
import type { Habit } from '@/ac-components/types/habits';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ChevronLeft, ChevronRight, Flame, Trophy, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DayCell, DayDetailsModal } from './Day';

const MOBILE_BREAKPOINT = 768;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitCalendarProps {
  habits: Habit[];
  currentDate: Date;
  onDateSelect?: (date: Date) => void;
  onToggle?: (habitId: string, date: string) => void;
}

interface DayStatus {
  total: number;
  completed: number;
  habits: Array<Habit & { completed: boolean }>;
}

export function HabitCalendar({
  habits,
  currentDate,
  onDateSelect,
  onToggle,
}: HabitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(currentDate));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoized calendar calculations
  const weeks = useMemo(() => {
    return viewMode === 'month'
      ? getMonthWeeks(currentMonth)
      : [getWeekDays(currentMonth)];
  }, [currentMonth, viewMode]);

  const getDayStatus = (date: Date): DayStatus => {
    const dateStr = formatDate(date);
    return habits.reduce(
      (acc, habit) => {
        if (!isHabitActiveForDate(habit, dateStr)) return acc;
        const completed = habit.completedDates.includes(dateStr);
        return {
          total: acc.total + 1,
          completed: acc.completed + (completed ? 1 : 0),
          habits: [...acc.habits, { ...habit, completed }],
        };
      },
      { total: 0, completed: 0, habits: [] } as DayStatus,
    );
  };

  return (
    <div className="space-y-2">
      <CalendarControls
        currentMonth={currentMonth}
        viewMode={viewMode}
        onMonthChange={months =>
          setCurrentMonth(
            prev => new Date(prev.setMonth(prev.getMonth() + months)),
          )
        }
        onViewToggle={() =>
          setViewMode(prev => (prev === 'month' ? 'week' : 'month'))
        }
        onToday={() => setCurrentMonth(new Date())}
        isMobile={isMobile}
      />

      <Tooltip.Provider>
        <div
          className={cn(
            'grid gap-px text-sm bg-muted/50 rounded-lg p-1',
            viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-1 sm:grid-cols-7',
            isMobile && viewMode === 'week' && 'overflow-x-auto',
          )}
        >
          {DAYS.map(day => (
            <div
              key={day}
              className={cn(
                'py-2 font-medium text-muted-foreground',
                isMobile && viewMode === 'week' && 'min-w-[100px]',
              )}
            >
              {isMobile ? day.slice(0, 1) : day}
            </div>
          ))}

          {weeks.map((week, weekIndex) =>
            week.map((date, dayIndex) => (
              <DayCell
                key={`${weekIndex}-${dayIndex}`}
                date={date}
                currentMonth={currentMonth}
                viewMode={viewMode}
                isMobile={isMobile}
                onSelect={() => {
                  setSelectedDate(date);
                  onDateSelect?.(date);
                }}
                getDayStatus={getDayStatus}
              />
            )),
          )}
        </div>
      </Tooltip.Provider>

      {selectedDate && (
        <DayDetailsModal
          date={selectedDate}
          habits={habits}
          onToggle={onToggle}
          onClose={() => setSelectedDate(null)}
          getDayStatus={getDayStatus}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

const CalendarControls = ({
  currentMonth,
  viewMode,
  onMonthChange,
  onViewToggle,
  onToday,
  isMobile,
}: {
  currentMonth: Date;
  viewMode: 'month' | 'week';
  onMonthChange: (months: number) => void;
  onViewToggle: () => void;
  onToday: () => void;
  isMobile: boolean;
}) => (
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size={isMobile ? 'icon' : 'sm'}
          onClick={() => onMonthChange(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-base sm:text-lg">
          {currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>
        <Button
          variant="ghost"
          size={isMobile ? 'icon' : 'sm'}
          onClick={() => onMonthChange(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size={isMobile ? 'sm' : 'default'}
        className="text-xs sm:text-sm"
        onClick={onViewToggle}
      >
        {viewMode === 'month' ? 'Week' : 'Month'}
      </Button>
      <Button
        variant="outline"
        size={isMobile ? 'sm' : 'default'}
        className="text-xs sm:text-sm"
        onClick={onToday}
      >
        Today
      </Button>
    </div>
  </div>
);
