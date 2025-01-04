import type { Habit } from '@/app/types/habits';
import { DateTimePickerForm } from '@/components/ui/date-time-picker-form';
import { useHabitStore } from '@/hooks/useHabitStore';
import React, { useState, useEffect } from 'react';
import type { HabitPlugin } from '../types';

export const reminderPlugin: HabitPlugin = {
  id: 'reminder-plugin',
  name: 'Reminders',
  description: 'Set reminders to keep track of your habits.',
  version: '1.0.0',

  settings: {
    enabled: true,
    allowMultipleReminders: false,
  },

  // Called when rendering the habit card, e.g., to show upcoming reminders
  RenderHabitCard(habit: Habit) {
    const reminders = habit.pluginData?.['reminder-plugin']?.reminders || [];
    return (
      <div>
        {reminders.length > 0 ? (
          <ul>
            {reminders.map((reminder: string, index: number) => (
              <li key={index}>
                Reminder: {new Date(reminder).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No reminders set</p>
        )}
      </div>
    );
  },

  // Render a form for setting reminders
  RenderHabitForm(
    habit: Habit | null,
    handleSettingChange: (habitUpdated: Habit) => void,
  ) {
    if (habit) {
      return (
        <ReminderForm habit={habit} handleSettingChange={handleSettingChange} />
      );
    }
    return null;
  },
};

const ReminderForm = ({
  habit,
  handleSettingChange,
}: {
  habit: Habit;
  handleSettingChange: (habitUpdated: Habit) => void;
}) => {
  const [reminders, setReminders] = useState<string[]>(
    habit.pluginData?.['reminder-plugin']?.reminders || [],
  );

  const addReminder = (dateTime: Date) => {
    console.log(dateTime);
    const newReminder = dateTime.toISOString();
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    updateHabitPluginData(updatedReminders);
  };

  const removeReminder = (index: number) => {
    const updatedReminders = reminders.filter((_, i) => i !== index);
    setReminders(updatedReminders);
    updateHabitPluginData(updatedReminders);
  };

  const updateHabitPluginData = (updatedReminders: string[]) => {
    handleSettingChange({
      ...habit,
      pluginData: {
        ...habit.pluginData,
        'reminder-plugin': { reminders: updatedReminders },
      },
    });
  };

  return (
    <div>
      <h4>Set Reminders</h4>
      <DateTimePickerForm
        onSubmit={(data: { dateTime: Date }) => {
          addReminder(data.dateTime);
        }}
      />
      <ul>
        {reminders.map((reminder, index) => (
          <li key={index}>
            {new Date(reminder).toLocaleString()}
            <button
              className="ml-2 text-red-500"
              onClick={() => removeReminder(index)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
