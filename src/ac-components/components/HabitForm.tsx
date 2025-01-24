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
import { Edit3, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { formatDate } from '@/app/lib/date-utils';
import { generateHabitId } from '@/app/lib/habits';
import { pluginManager } from '@/app/lib/plugins';
import type { Habit, HabitFrequency } from '@/app/types/habits';
import { PluginMarketplace } from './plugins/PluginMarketplace';
// import { pluginManager } from '@/lib/plugins';
// import { PluginMarketplace } from './plugins/PluginMarketplace';

const daysOfWeek = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
] as const;

interface HabitFormProps {
  habit?: Habit | null;
  currentDate: Date;
  onSave: (updatedHabit: Habit) => void;
}

export function HabitForm({ habit, currentDate, onSave }: HabitFormProps) {
  const [open, setOpen] = useState(false);

  const [habitState, setHabitState] = useState<Habit>({
    id: habit?.id ?? generateHabitId(),
    title: habit?.title ?? '',
    description: habit?.description ?? '',
    frequency: habit?.frequency ?? 'daily',
    startDate: habit?.startDate ?? formatDate(currentDate),
    endDate: habit?.endDate,
    daysOfWeek: habit?.daysOfWeek ?? [],
    specificDayOfMonth: habit?.specificDayOfMonth ?? null,
    repeatMonthly: habit?.repeatMonthly ?? false,
    completedDates: habit?.completedDates ?? [],
    hidden: habit?.hidden ?? false,
    plugins: habit?.plugins ?? [],
  });

  useEffect(() => {
    if (habit) {
      setHabitState({
        id: habit.id,
        title: habit.title,
        description: habit.description ?? '',
        frequency: habit.frequency ?? 'daily',
        startDate: habit.startDate,
        endDate: habit.endDate,
        daysOfWeek: habit.daysOfWeek ?? [],
        specificDayOfMonth: habit.specificDayOfMonth ?? null,
        repeatMonthly: habit.repeatMonthly ?? false,
        completedDates: habit.completedDates ?? [],
        hidden: habit.hidden ?? false,
        plugins: habit.plugins ?? [],
      });
    }
  }, [habit]);

  const updateHabitField = (field: keyof Habit, value: any) => {
    setHabitState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await pluginManager.executeHook('onHabitCreate', habitState);
    onSave(habitState);

    if (!habit) {
      setHabitState({
        id: generateHabitId(),
        title: '',
        description: '',
        frequency: 'daily',
        startDate: formatDate(currentDate),
        endDate: undefined,
        daysOfWeek: [],
        specificDayOfMonth: null,
        repeatMonthly: false,
        completedDates: [],
        hidden: false,
        plugins: [],
      });
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          {habit ? (
            <>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Habit
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Habit
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Create New Habit'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            placeholder="Habit title"
            value={habitState.title}
            onChange={e => updateHabitField('title', e.target.value)}
            required
          />

          <Textarea
            placeholder="Description (optional)"
            value={habitState.description}
            onChange={e => updateHabitField('description', e.target.value)}
            rows={3}
          />

          <Select
            value={habitState.frequency}
            onValueChange={(value: HabitFrequency) =>
              updateHabitField('frequency', value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>

          {habitState.frequency === 'weekly' && (
            <div className="space-y-4">
              <label className="text-sm font-medium">
                Select Days of the Week
              </label>
              <div className="flex gap-2 flex-wrap mt-2">
                {daysOfWeek.map(day => (
                  <label
                    key={day.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      checked={habitState?.daysOfWeek?.includes(day.value)}
                      onCheckedChange={() =>
                        updateHabitField(
                          'daysOfWeek',
                          habitState?.daysOfWeek?.includes(day.value)
                            ? habitState?.daysOfWeek.filter(
                                d => d !== day.value,
                              )
                            : [
                                ...(habitState.daysOfWeek as number[]),
                                day.value,
                              ],
                        )
                      }
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {habitState.frequency === 'monthly' && (
            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Day of the month"
                value={habitState.specificDayOfMonth || ''}
                onChange={e =>
                  updateHabitField(
                    'specificDayOfMonth',
                    e.target.value ? Number.parseInt(e.target.value) : null,
                  )
                }
              />
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={habitState.repeatMonthly}
                  onCheckedChange={checked =>
                    updateHabitField('repeatMonthly', checked === true)
                  }
                />
                <span>Repeat Monthly</span>
              </label>
            </div>
          )}

          <PluginMarketplace
            habit={habitState}
            onHabitUpdate={updatedHabit => {
              setHabitState(updatedHabit);
              updateHabitField('plugins', updatedHabit.plugins || []);
            }}
          />

          <Button type="submit" className="w-full">
            {habit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
