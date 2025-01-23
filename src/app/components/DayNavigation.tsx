'use client';

import { formatDisplayDate } from '@/app/lib/date-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface DayNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function DayNavigation({
  currentDate,
  onDateChange,
}: DayNavigationProps) {
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <Button variant="outline" size="icon" onClick={goToPreviousDay}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold">
          {formatDisplayDate(currentDate)}
        </h2>
        <Button variant="link" onClick={goToToday} className="text-sm">
          Today
        </Button>
      </div>
      <Button variant="outline" size="icon" onClick={goToNextDay}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
