'use client';

import { HabitForm } from '@/ac-components/components/HabitFormComponent';
import { formatDate } from '@/ac-components/lib/date-utils';
import { isHabitActiveForDate } from '@/ac-components/lib/streak-utils';
import type { Habit } from '@/ac-components/types/habits';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { updateHabitPartial } from '../lib/utils';
import { HabitCard } from './HabitCard';

interface SortableHabitCardProps {
  habit: Habit;
  currentDate: Date;
  onToggle: (habitId: string, date: string) => void;
  isEditMode: boolean;
}

export function SortableHabitCard({
  habit,
  currentDate,
  onToggle,
  isEditMode,
}: SortableHabitCardProps) {
  const dateStr = formatDate(currentDate);
  const isActive = isHabitActiveForDate(habit, dateStr);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  if (!isActive || habit.hidden) {
    return null;
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group touch-manipulation"
    >
      <div className="flex items-center">
        {isEditMode && (
          <button
            {...attributes}
            {...listeners}
            className="flex items-center justify-center p-3 text-muted-foreground/50 hover:text-muted-foreground touch-none transition-colors"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1">
          <HabitCard
            habit={habit}
            currentDate={currentDate}
            onToggle={onToggle}
          />
        </div>
        {isEditMode && (
          <section className="ml-2">
            <HabitForm
              habit={habit}
              currentDate={new Date()}
              onSave={data => {
                updateHabitPartial(habit.id, data);
                window.location.reload();
              }}
            />
          </section>
        )}
      </div>
    </div>
  );
}
