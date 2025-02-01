'use client';
import { Button } from '@/ac-components/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ac-components/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ac-components/components/ui/form';
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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PluginManagement } from '../plugins/PluginManagement';

type HabitFormData = Omit<
  Habit,
  'archived' | 'enabled' | 'archiveDate' | 'hidden' | 'id'
>;

type HabitFormProps = {
  habit?: Habit | null;
  currentDate: Date;
  onSave: (updatedHabit: Habit) => void;
  buttonClass?: string;
};

export const HabitForm = ({
  habit,
  currentDate,
  onSave,
  buttonClass,
}: HabitFormProps) => {
  const defaultDate = formatDate(currentDate);
  const [open, setOpen] = useState(false);

  const form = useForm<Habit>({
    defaultValues: {
      title: habit?.title || '',
      description: habit?.description || '',
      frequency: habit?.frequency || 'daily',
      startDate: habit?.startDate || defaultDate,
      endDate: habit?.endDate || undefined,
      daysOfWeek: habit?.daysOfWeek || [],
      specificDayOfMonth: habit?.specificDayOfMonth || undefined,
      repeatMonthly: habit?.repeatMonthly || false,
      plugins: [],
      pluginData: [],
    },
  });

  const { control, handleSubmit, watch, setValue } = form;

  const onSubmit = async (data: HabitFormData) => {
    try {
      const updatedHabit: Habit = {
        id: habit?.id || generateHabitId(),
        ...data,
        completedDates: habit?.completedDates || [],
      };

      // Execute plugin hooks before saving
      await pluginManager.executeHook('onHabitCreate', updatedHabit);

      // Save the habit
      onSave(updatedHabit);

      // Reset the form if creating a new habit
      if (!habit) {
        form.reset({
          title: '',
          description: '',
          frequency: 'daily',
          startDate: formatDate(new Date()),
          endDate: undefined,
          daysOfWeek: [],
          specificDayOfMonth: undefined,
          repeatMonthly: false,
        });
      }

      setOpen(false);
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  const frequency = watch('frequency');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`w-auto mx-auto ${buttonClass}`}
          aria-label={habit ? 'Edit habit' : 'Create new habit'}
        >
          {habit ? <Edit3 /> : <PlusCircle />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'Create Habit'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Title */}
            <FormField
              control={control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter habit title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Optional description"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Frequency */}
            <FormField
              control={control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select
                    onValueChange={value =>
                      setValue('frequency', value as HabitFrequency)
                    }
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Weekly Configuration */}
            {frequency === 'weekly' && (
              <FormField
                control={control}
                name="daysOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Days</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-3">
                        {[0, 1, 2, 3, 4, 5, 6].map(day => (
                          <label key={day} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={
                                Array.isArray(field.value) &&
                                field.value.includes(day)
                              }
                              onChange={e => {
                                const isChecked = e.target.checked;
                                console.log(isChecked);
                                const updatedDays = isChecked
                                  ? [...(field.value || []), day] // Add the day if checked
                                  : field.value?.filter(d => d !== day); // Remove the day if unchecked

                                setValue('daysOfWeek', updatedDays, {
                                  shouldValidate: true,
                                });
                              }}
                            />
                            <span>
                              {
                                [
                                  'Sun',
                                  'Mon',
                                  'Tue',
                                  'Wed',
                                  'Thu',
                                  'Fri',
                                  'Sat',
                                ][day]
                              }
                            </span>
                          </label>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Monthly Configuration */}
            {frequency === 'monthly' && (
              <>
                <FormField
                  control={control}
                  name="specificDayOfMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Month</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          max="31"
                          placeholder="Enter day of month"
                          value={field.value?.toString() || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="repeatMonthly"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={e =>
                              setValue('repeatMonthly', e.target.checked)
                            }
                          />
                          <span>Repeat Monthly</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Plugin Marketplace */}
            {habit && (
              <FormField
                control={control}
                name="plugins"
                render={() => (
                  <FormItem>
                    <FormLabel>Plugins</FormLabel>
                    <FormControl>
                      <PluginManagement
                        habit={habit}
                        onHabitUpdate={updatedHabit => {
                          setValue('plugins', updatedHabit.plugins);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full mt-4">
              {habit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
