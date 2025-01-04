export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  startDate: string;
  endDate?: string;
  completedDates: string[];
  daysOfWeek?: number[]; // For weekly habits
  specificDayOfMonth?: number | null; // For monthly habits
  repeatMonthly?: boolean; // For monthly habits
  archived?: boolean;
  archiveDate?: string;
  hidden?: boolean;
  plugins?: PluginHabit[];
  pluginData?: Record<string, any>; // Serialized plugin content
}

export interface PluginHabit {
  id: string;
  enabled: boolean;
  settings?: Record<string, any>;
}
