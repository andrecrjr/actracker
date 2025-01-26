import { DateRangePicker } from '@/ac-components/components/DateRangePicker';
import { Badge } from '@/ac-components/components/ui/badge';
import type { Habit } from '@/ac-components/types/habits';
import React, { useEffect, useState } from 'react';
import type { HabitPlugin } from '../types';

export const dateRangePlugin: HabitPlugin = {
  id: 'due-date-plugin',
  name: 'Due Date',
  description: 'Limit your habits within due dates.',
  version: '1.0.0',

  // Plugin settings for toggling the plugin
  settings: {
    enabled: true,
    enforceDueDate: true,
  },

  RenderHabitCard(habit: Habit) {
    if (habit.endDate) {
      return (
        <Badge variant="outline" className="bg-secondary/50">
          Until {habit.endDate}
        </Badge>
      );
    }

    return null;
  },

  // Render a form for setting the start and due dates
  RenderHabitForm(
    habit: Habit | null,
    handleSettingChange: (habitUpdated: Habit) => void,
  ) {
    if (habit)
      return (
        <EndDateUpdater
          habit={habit}
          handleSettingChange={handleSettingChange}
        />
      );
  },
};

const EndDateUpdater = ({
  habit,
  handleSettingChange,
}: { habit: Habit; handleSettingChange: (habitUpdated: Habit) => void }) => {
  // Initialize state with habit's dates or fallback to current date
  const [startDate, setStartDate] = useState(
    habit?.startDate ? new Date(habit.startDate) : new Date(),
  );
  const [endDate, setEndDate] = useState(
    habit?.endDate ? new Date(habit.endDate) : new Date(),
  );

  useEffect(() => {
    setStartDate(habit?.startDate ? new Date(habit.startDate) : new Date());
    setEndDate(habit?.endDate ? new Date(habit.endDate) : new Date());
  }, [habit]);

  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    handleSettingChange({
      ...habit,
      ...{ startDate: date.toISOString().split('T')[0] },
    });
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
    handleSettingChange({
      ...habit,
      ...{ endDate: date.toISOString().split('T')[0] },
    });
  };

  return (
    <div>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />
    </div>
  );
};
