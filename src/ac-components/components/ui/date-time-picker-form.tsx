'use client';

import { Button } from '@/ac-components/components/ui/button';
import { Calendar } from '@/ac-components/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/ac-components/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ac-components/components/ui/popover';
import { cn } from '@/app/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { TimePickerDemo } from './time-picker-demo';

import { toast } from '@/ac-components/hooks/use-toast';

const formSchema = z.object({
  dateTime: z.date(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export function DateTimePickerForm({
  onSubmit,
}: {
  onSubmit: (data: { dateTime: Date }) => void;
}) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: { dateTime: new Date() },
  });

  const handleSubmit = (data: FormSchemaType, e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form behavior
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        className="flex items-end gap-4 justify-center"
        onSubmit={e => form.handleSubmit(data => handleSubmit(data, e))(e)}
      >
        <FormField
          control={form.control}
          name="dateTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">DateTime</FormLabel>
              <Popover>
                <FormControl>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-[280px] justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, 'PPP HH:mm:ss')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border">
                    <TimePickerDemo
                      setDate={field.onChange}
                      date={field.value}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        <Button type="submit">Add Reminder</Button>
      </form>
    </Form>
  );
}
