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

export const DayCell = ({
  date,
  currentMonth,
  viewMode,
  onSelect,
  getDayStatus,
}: {
  date: Date;
  currentMonth: Date;
  viewMode: 'month' | 'week';
  onSelect: () => void;
  getDayStatus: (date: Date) => DayStatus;
}) => {
  const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
  const { total, completed } = getDayStatus(date);
  const isToday = formatDate(date) === formatDate(new Date());
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Tooltip.Root delayDuration={100}>
      <Tooltip.Trigger asChild>
        <button
          onClick={onSelect}
          className={cn(
            'aspect-square rounded-md p-1 text-sm transition-all',
            'flex flex-col items-center justify-start',
            !isCurrentMonth && 'opacity-50',
            isToday ? 'bg-primary/10 ring-2 ring-primary' : 'bg-background',
            'hover:ring-2 hover:ring-primary focus-visible:outline-none',
            viewMode === 'week' && 'h-20',
          )}
        >
          <div className="flex items-center gap-1">
            <span
              className={cn('font-medium', isToday && 'text-primary font-bold')}
            >
              {date.getDate()}
            </span>
            {percentage === 100 && total > 0 && (
              <Trophy className="h-4 w-4 text-yellow-500" />
            )}
          </div>

          {total > 0 && (
            <div className="w-full mt-1 space-y-1">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-1">
                {/* {pluginIndicators} */}
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  <span>{percentage}%</span>
                </div>
              </div>
            </div>
          )}
        </button>
      </Tooltip.Trigger>

      <Tooltip.Content
        side="top"
        className="rounded-md bg-popover px-3 py-2 text-sm text-popover-foreground shadow-lg border"
      >
        <div className="flex flex-col items-center">
          <span className="font-medium mb-1">{formatDisplayDate(date)}</span>
          {total > 0 ? (
            <>
              <span className="text-green-500">{completed} completed</span>
              <span className="text-muted-foreground text-xs">
                of {total} habits
              </span>
            </>
          ) : (
            <span className="text-muted-foreground text-xs">
              No active habits
            </span>
          )}
        </div>
        <Tooltip.Arrow className="fill-popover" />
      </Tooltip.Content>
    </Tooltip.Root>
  );
};

export const DayDetailsModal = ({
  date,
  habits,
  onToggle,
  onClose,
  getDayStatus,
}: {
  date: Date;
  habits: Habit[];
  onToggle?: (habitId: string, date: string) => void;
  onClose: () => void;
  getDayStatus: (date: Date) => DayStatus;
}) => {
  const { completed, total, habits: dayHabits } = getDayStatus(date);
  const dateStr = formatDate(date);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {formatDisplayDate(date)}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <StatBadge value={completed} label="Completed" variant="success" />
            <StatBadge value={total} label="Total Habits" />
          </div>

          <div className="space-y-2">
            {dayHabits.map(habit => (
              <HabitDayItem
                key={habit.id}
                habit={habit}
                dateStr={dateStr}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const HabitDayItem = ({
  habit,
  dateStr,
  onToggle,
}: {
  habit: Habit & { completed: boolean };
  dateStr: string;
  onToggle?: (habitId: string, date: string) => void;
}) => {
  const pluginContent = usePluginContent(habit, dateStr);

  return (
    <div className="p-2 rounded-lg bg-muted/50 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{habit.title}</span>
        {onToggle && (
          <Button
            variant={habit.completed ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToggle(habit.id, dateStr)}
          >
            {habit.completed ? 'Completed' : 'Mark Complete'}
          </Button>
        )}
      </div>

      {pluginContent.length > 0 && (
        <div className="pt-2 space-y-2">
          {pluginContent.map((content, index) => (
            <div key={index} className="text-xs text-muted-foreground">
              {content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
const StatBadge = ({
  value,
  label,
  variant,
}: {
  value: number;
  label: string;
  variant?: 'success' | 'default';
}) => (
  <div
    className={cn(
      'text-center p-2 rounded-lg',
      variant === 'success' ? 'bg-green-500/10' : 'bg-muted',
    )}
  >
    <div
      className={cn(
        'text-2xl font-bold',
        variant === 'success' && 'text-green-500',
      )}
    >
      {value}
    </div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);
