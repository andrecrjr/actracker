'use client';

import type { Habit } from '@/app/types/habits';
import { formatDate } from '@/lib/date-utils';
import {
  getHabitOrderFromStorage,
  saveHabitOrderToStorage,
} from '@/lib/habits';
import { isHabitActiveForDate } from '@/lib/streak-utils';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CheckIcon, PencilIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { HabitCard } from './HabitCard';
import { SortableHabitCard } from './SortableHabitCard';
import { Button } from './ui/button';

interface DailyHabitListProps {
  habits: Habit[];
  currentDate: Date;
  onToggle: (habitId: string, date: string) => void;
}

export function DailyHabitList({
  habits,
  currentDate,
  onToggle,
}: DailyHabitListProps) {
  const currentDateStr = formatDate(currentDate);
  const [isEditMode, setIsEditMode] = useState(false);

  const activeHabits = useMemo(
    () =>
      habits.filter(
        habit => isHabitActiveForDate(habit, currentDateStr) && !habit.hidden,
      ),
    [habits, currentDateStr],
  );

  const [orderedHabits, setOrderedHabits] = useState<Habit[]>([]);
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
        distance: 10,
      },
    }),
  );

  useEffect(() => {
    const orderData = getHabitOrderFromStorage();
    const currentOrder = orderData[currentDateStr];

    if (currentOrder?.length) {
      const orderedList = [...activeHabits].sort((a, b) => {
        const indexA = currentOrder.indexOf(a.id);
        const indexB = currentOrder.indexOf(b.id);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      setOrderedHabits(orderedList);
    } else {
      setOrderedHabits(activeHabits);
    }
  }, [activeHabits, currentDateStr]);

  const handleDragStart = (event: DragStartEvent) => {
    if (!isEditMode) return;
    const { active } = event;
    const draggedHabit = orderedHabits.find(habit => habit.id === active.id);
    if (draggedHabit) {
      setActiveHabit(draggedHabit);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isEditMode) return;
    const { active, over } = event;
    setActiveHabit(null);

    if (!over || active.id === over.id) {
      return;
    }

    setOrderedHabits(items => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex);

      const orderData = getHabitOrderFromStorage();
      orderData[currentDateStr] = newOrder.map(habit => habit.id);
      saveHabitOrderToStorage(orderData);

      return newOrder;
    });
  };

  return (
    <div className="space-y-4">
      {orderedHabits.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="text-muted-foreground"
          >
            {isEditMode ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Done
              </>
            ) : (
              <>
                <PencilIcon className="h-4 w-4 mr-2" />
                Reorder
              </>
            )}
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedHabits.map(habit => habit.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {orderedHabits.map(habit => (
              <SortableHabitCard
                key={habit.id}
                habit={habit}
                currentDate={currentDate}
                onToggle={onToggle}
                isEditMode={isEditMode}
              />
            ))}
            {orderedHabits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No habits for this day. Create one to get started!
              </div>
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeHabit ? (
            <div className="opacity-80">
              <HabitCard
                habit={activeHabit}
                currentDate={currentDate}
                onToggle={onToggle}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
