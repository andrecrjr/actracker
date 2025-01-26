import { usePluginContent } from '@/ac-components/hooks/usePluginContent';
import { formatDate, formatDisplayDate } from '@/ac-components/lib/date-utils';
import { pluginManager } from '@/ac-components/lib/plugins';
import { isHabitActiveForDate } from '@/ac-components/lib/streak-utils';
import { cn } from '@/ac-components/lib/utils';
import { getMonthWeeks, getWeekDays } from '@/ac-components/lib/utils';
import type { Habit } from '@/ac-components/types/habits';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Flame,
  Trophy,
  X,
} from 'lucide-react';
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
  isMobile,
  onSelect,
  getDayStatus,
}: {
  date: Date;
  currentMonth: Date;
  viewMode: 'month' | 'week';
  isMobile: boolean;
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
            'p-1.5 text-sm transition-all flex flex-col items-center justify-start',
            'rounded-md focus-visible:outline-none',
            !isCurrentMonth && 'opacity-50',
            isToday ? 'bg-primary/10 ring-1 ring-primary' : 'bg-background',
            'hover:ring-1 hover:ring-primary',
            viewMode === 'week' && 'min-h-[80px]',
            isMobile && 'h-14 w-full',
            !isMobile && 'aspect-square',
          )}
        >
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'font-medium',
                isToday && 'text-primary font-bold',
                isMobile && 'text-sm',
              )}
            >
              {date.getDate()}
            </span>
            {percentage === 100 && total > 0 && (
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
            )}
          </div>

          {total > 0 && (
            <div className="w-full mt-1 space-y-1">
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {!isMobile && (
                <div className="flex items-center justify-center gap-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    <span>{percentage}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </button>
      </Tooltip.Trigger>

      <Tooltip.Content
        side={isMobile ? 'bottom' : 'top'}
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

interface DayDetailsModalProps {
  date: Date;
  habits: Habit[];
  onToggle?: (habitId: string, date: string) => void;
  onClose: () => void;
  getDayStatus: (date: Date) => DayStatus;
  isMobile: boolean;
}

export const DayDetailsModal = ({
  date,
  habits,
  onToggle,
  onClose,
  getDayStatus,
  isMobile,
}: DayDetailsModalProps) => {
  const { completed, total, habits: dayHabits } = getDayStatus(date);
  const dateStr = formatDate(date);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'p-4 sm:p-6',
          isMobile
            ? 'w-full h-[100dvh] max-h-[100dvh] rounded-none'
            : 'max-w-md',
        )}
      >
        <DialogHeader className="mb-4">
          <DialogTitle
            className={cn(
              'flex items-center justify-between',
              isMobile ? 'text-xl' : 'text-lg',
            )}
          >
            {formatDisplayDate(date)}
          </DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            'space-y-4 overflow-y-auto',
            isMobile ? 'h-[calc(100dvh-180px)]' : '',
          )}
        >
          <div
            className={cn(
              'grid gap-2',
              isMobile ? 'grid-cols-1' : 'grid-cols-2',
            )}
          >
            <StatBadge
              value={completed}
              label="Completed"
              variant="success"
              isMobile={isMobile}
            />
            <StatBadge value={total} label="Total Habits" isMobile={isMobile} />
          </div>

          <div className="space-y-2">
            {dayHabits.map(habit => (
              <HabitDayItem
                key={habit.id}
                habit={habit}
                dateStr={dateStr}
                onToggle={onToggle}
                isMobile={isMobile}
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
  isMobile,
}: {
  habit: Habit & { completed: boolean };
  dateStr: string;
  onToggle?: (habitId: string, date: string) => void;
  isMobile: boolean;
}) => {
  const pluginContent = usePluginContent(habit, dateStr);

  return (
    <div
      className={cn(
        'p-3 rounded-lg bg-muted/50 space-y-2',
        isMobile ? 'text-base' : 'text-sm',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{habit.title}</span>
        {onToggle && (
          <button
            onClick={() => onToggle(habit.id, dateStr)}
            className="focus:outline-none active:scale-95 transition-transform"
          >
            {habit.completed ? (
              <CheckCircle2
                className={cn('text-primary', isMobile ? 'h-8 w-8' : 'h-6 w-6')}
              />
            ) : (
              <Circle
                className={cn(
                  'text-muted-foreground/50',
                  isMobile ? 'h-8 w-8' : 'h-6 w-6',
                )}
              />
            )}
          </button>
        )}
      </div>

      {pluginContent.length > 0 && (
        <div className="pt-2 space-y-2">
          {pluginContent.map((content, index) => (
            <div
              key={content?.key || index}
              className="text-xs text-muted-foreground"
            >
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
  isMobile,
}: {
  value: number;
  label: string;
  variant?: 'success' | 'default';
  isMobile: boolean;
}) => (
  <div
    className={cn(
      'text-center p-3 rounded-lg',
      variant === 'success' ? 'bg-green-500/10' : 'bg-muted',
      isMobile ? 'text-base' : 'text-sm',
    )}
  >
    <div
      className={cn(
        'font-bold',
        variant === 'success' ? 'text-green-500' : '',
        isMobile ? 'text-3xl' : 'text-2xl',
      )}
    >
      {value}
    </div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);
