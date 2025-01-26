'use client';
import { Button } from '@/ac-components/components/ui/button';
import { Checkbox } from '@/ac-components/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ac-components/components/ui/dialog';
import { Input } from '@/ac-components/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ac-components/components/ui/select';
import { Textarea } from '@/ac-components/components/ui/textarea';
import { formatDate } from '@/ac-components/lib/date-utils';
import { generateHabitId } from '@/ac-components/lib/habits';
import { pluginManager } from '@/ac-components/lib/plugins';
import type { Habit, HabitFrequency } from '@/ac-components/types/habits';
import { Edit3, PlusCircle } from 'lucide-react';
import { memo, useCallback, useEffect, useReducer, useState } from 'react';
import { PluginMarketplace } from './plugins/PluginMarketplace';

type DailyRecurrence = 'unique' | 'recurring';
type HabitAction =
  | { type: 'SET_FIELD'; field: keyof Habit; value: any }
  | { type: 'RESET'; currentDate: string }
  | { type: 'SET_DAILY_TYPE'; dailyType: DailyRecurrence }
  | { type: 'UPDATE_ALL'; value: Habit };

const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
] as const;

type HabitFormProps = {
  habit?: Habit | null;
  currentDate: Date;
  onSave: (updatedHabit: Habit) => void;
};

const habitReducer = (state: Habit, action: HabitAction): Habit => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'RESET':
      return getInitialState(undefined, action.currentDate);
    case 'SET_DAILY_TYPE':
      return {
        ...state,
        endDate: action.dailyType === 'unique' ? state.startDate : undefined,
        frequency: 'daily',
      };
    case 'UPDATE_ALL':
      return action.value;
    default:
      return state;
  }
};

const getInitialState = (
  habit?: Habit | null,
  currentDate?: string,
): Habit => ({
  id: habit?.id ?? generateHabitId(),
  title: habit?.title ?? '',
  description: habit?.description ?? '',
  frequency: habit?.frequency ?? 'daily',
  startDate: habit?.startDate ?? currentDate!,
  endDate: habit?.endDate,
  daysOfWeek: habit?.daysOfWeek ?? [],
  specificDayOfMonth: habit?.specificDayOfMonth ?? null,
  repeatMonthly: habit?.repeatMonthly ?? false,
  completedDates: habit?.completedDates ?? [],
  hidden: habit?.hidden ?? false,
  plugins: habit?.plugins ?? [],
});

const DailyTypeSelector = memo(
  ({
    dailyType,
    onTypeChange,
  }: {
    dailyType: DailyRecurrence;
    onTypeChange: (type: DailyRecurrence) => void;
  }) => (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <Button
        variant={dailyType === 'unique' ? 'default' : 'outline'}
        onClick={() => onTypeChange('unique')}
        type="button"
      >
        Single Day
      </Button>
      <Button
        variant={dailyType === 'recurring' ? 'default' : 'outline'}
        onClick={() => onTypeChange('recurring')}
        type="button"
      >
        Recurring
      </Button>
    </div>
  ),
);

const WeeklyConfig = memo(
  ({
    daysOfWeek,
    onDaysChange,
  }: {
    daysOfWeek: number[];
    onDaysChange: (days: number[]) => void;
  }) => (
    <div className="space-y-4">
      <label className="text-sm font-medium">Select Days</label>
      <div className="flex flex-wrap gap-3">
        {DAYS_OF_WEEK.map(day => (
          <label key={day.value} className="flex items-center gap-2">
            <Checkbox
              checked={daysOfWeek.includes(day.value)}
              onCheckedChange={checked =>
                onDaysChange(
                  checked
                    ? [...daysOfWeek, day.value]
                    : daysOfWeek.filter(d => d !== day.value),
                )
              }
            />
            <span className="text-sm">{day.label}</span>
          </label>
        ))}
      </div>
    </div>
  ),
);

const MonthlyConfig = memo(
  ({
    dayOfMonth,
    repeatMonthly,
    onDayChange,
    onRepeatChange,
  }: {
    dayOfMonth: number | null;
    repeatMonthly?: boolean;
    onDayChange: (day: number | null) => void;
    onRepeatChange: (repeat: boolean) => void;
  }) => (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Day of Month</label>
        <Input
          type="number"
          value={dayOfMonth ?? ''}
          onChange={e =>
            onDayChange(e.target.value ? parseInt(e.target.value) : null)
          }
          min="1"
          max="31"
        />
      </div>
      <label className="flex items-center gap-2">
        <Checkbox
          checked={repeatMonthly}
          onCheckedChange={checked => onRepeatChange(!!checked)}
        />
        <span className="text-sm">Repeat Monthly</span>
      </label>
    </div>
  ),
);

const useHabitState = (habit?: Habit | null, currentDate?: Date) => {
  const initialDate = formatDate(currentDate!);
  const [state, dispatch] = useReducer(
    habitReducer,
    getInitialState(habit, initialDate),
  );
  const dailyType = state.endDate ? 'unique' : 'recurring';

  useEffect(() => {
    if (habit) {
      dispatch({ type: 'SET_FIELD', field: 'id', value: habit.id });
    }
  }, [habit]);

  const setDailyType = useCallback((type: DailyRecurrence) => {
    dispatch({ type: 'SET_DAILY_TYPE', dailyType: type });
  }, []);

  const setField = useCallback((field: keyof Habit, value: any) => {
    console.log('no set field', value);
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setAllField = useCallback((value: Habit) => {
    console.log('no set field', value);
    dispatch({ type: 'UPDATE_ALL', value });
  }, []);

  const reset = useCallback((currentDate: string) => {
    dispatch({ type: 'RESET', currentDate });
  }, []);

  return { state, dailyType, setDailyType, setField, reset, setAllField };
};

export const HabitForm = ({ habit, currentDate, onSave }: HabitFormProps) => {
  const [open, setOpen] = useState(false);
  const { state, dailyType, setDailyType, setField, reset, setAllField } =
    useHabitState(habit, currentDate);
  const currentDateStr = formatDate(currentDate);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await pluginManager.executeHook('onHabitCreate', state);
        onSave(state);
        setOpen(false);
        if (!habit) reset(currentDateStr);
      } catch (error) {
        console.error('Habit save failed:', error);
      }
    },
    [state, onSave, habit, reset, currentDateStr],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          aria-label={habit ? 'Edit habit' : 'Create new habit'}
        >
          {habit ? <Edit3 className="mr-2" /> : <PlusCircle className="mr-2" />}
          {habit ? 'Edit Habit' : 'New Habit'}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {habit ? 'Edit Habit' : 'Create Habit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Habit Name</label>
            <Input
              value={state.title}
              onChange={e => setField('title', e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <Textarea
              value={state.description}
              onChange={e => setField('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Frequency</label>
            <Select
              value={state.frequency}
              onValueChange={v => setField('frequency', v as HabitFrequency)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.frequency === 'daily' && (
            <DailyTypeSelector
              dailyType={dailyType as DailyRecurrence}
              onTypeChange={setDailyType}
            />
          )}

          {state.frequency === 'weekly' && (
            <WeeklyConfig
              daysOfWeek={state?.daysOfWeek!}
              onDaysChange={days => setField('daysOfWeek', days)}
            />
          )}

          {state.frequency === 'monthly' && (
            <MonthlyConfig
              dayOfMonth={state.specificDayOfMonth!}
              repeatMonthly={state.repeatMonthly}
              onDayChange={day => setField('specificDayOfMonth', day)}
              onRepeatChange={repeat => setField('repeatMonthly', repeat)}
            />
          )}

          <PluginMarketplace
            habit={state}
            onHabitUpdate={updated => {
              setAllField(updated);
            }}
          />

          <Button type="submit" className="w-full mt-4">
            {habit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
