'use client';

import { Button } from '@/ac-components/components/ui/button';
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
import { generateHabitId } from '@/ac-components/lib/habits';
import type { Habit, HabitFrequency } from '@/app/types/habits';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';

interface NewHabitDialogProps {
  onHabitCreate: (habit: Habit) => void;
}

export function NewHabitDialog({ onHabitCreate }: NewHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHabit: Habit = {
      id: generateHabitId(),
      title,
      frequency,
      startDate: new Date().toISOString().split('T')[0],
      completedDates: [],
    };
    onHabitCreate(newHabit);
    setTitle('');
    setFrequency('daily');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Habit title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <Select
            value={frequency}
            onValueChange={(value: HabitFrequency) => setFrequency(value)}
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
          <Button type="submit" className="w-full">
            Create Habit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
