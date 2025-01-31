'use client';

import { formatDate } from '@/ac-components/lib/date-utils';
import {
  getHabitOrderFromStorage,
  saveHabitOrderToStorage,
} from '@/ac-components/lib/habits';
import { isHabitActiveForDate } from '@/ac-components/lib/streak-utils';
import type { Habit } from '@/ac-components/types/habits';
import {
  DndContext,
  DragOverlay,
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
import React, { useEffect, useMemo, useState, ReactNode } from 'react';
import { HabitCard } from './HabitCard';
import { SortableHabitCard } from './SortableHabitCard';
import { Button } from './ui/button';

type DailyHabitListProps = {
  habits: Habit[];
  currentDate: Date;
  onToggle: (habitId: string, date: string) => void;
  children?: ReactNode;
};

type UseOrderedHabitsReturn = [
  Habit[],
  React.Dispatch<React.SetStateAction<Habit[]>>,
];

function useOrderedHabits(
  habits: Habit[],
  currentDateStr: string,
): UseOrderedHabitsReturn {
  const activeHabits = useMemo(
    () =>
      habits.filter(
        habit => isHabitActiveForDate(habit, currentDateStr) && !habit.hidden,
      ),
    [habits, currentDateStr],
  );

  const [orderedHabits, setOrderedHabits] = useState<Habit[]>([]);

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

  return [orderedHabits, setOrderedHabits];
}

function HabitReorderButton({
  isEditMode,
  toggleEditMode,
}: { isEditMode: boolean; toggleEditMode: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleEditMode}
      className="text-muted-foreground"
    >
      {isEditMode ? (
        <>
          <CheckIcon className="h-4 w-4 mr-2" /> Done
        </>
      ) : (
        <>
          <PencilIcon className="h-4 w-4" />
        </>
      )}
    </Button>
  );
}

function useDragAndDrop(
  orderedHabits: Habit[],
  setOrderedHabits: React.Dispatch<React.SetStateAction<Habit[]>>,
  currentDateStr: string,
  isEditMode: boolean,
) {
  const [activeHabit, setActiveHabit] = useState<Habit | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5, distance: 10 },
    }),
  );

  const handleDragStart = (event: any) => {
    if (!isEditMode) return;
    const { active } = event;
    const draggedHabit = orderedHabits.find(habit => habit.id === active.id);
    setActiveHabit(draggedHabit || null);
  };

  const handleDragEnd = (event: any) => {
    if (!isEditMode) return;
    const { active, over } = event;

    setActiveHabit(null);
    if (!over || active.id === over.id) return;

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

  return { sensors, activeHabit, handleDragStart, handleDragEnd };
}

export function DailyHabitList({
  habits,
  currentDate,
  onToggle,
  children,
}: DailyHabitListProps) {
  const currentDateStr = formatDate(currentDate);
  const [isEditMode, setIsEditMode] = useState(false);
  const [orderedHabits, setOrderedHabits] = useOrderedHabits(
    habits,
    currentDateStr,
  );
  const { sensors, activeHabit, handleDragStart, handleDragEnd } =
    useDragAndDrop(orderedHabits, setOrderedHabits, currentDateStr, isEditMode);

  const toggleEditMode = () => setIsEditMode(!isEditMode);

  return (
    <div className="space-y-4">
      {children}

      {orderedHabits.length > 0 && (
        <div className="flex justify-end">
          <HabitReorderButton
            isEditMode={isEditMode}
            toggleEditMode={toggleEditMode}
          />
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
          {activeHabit && (
            <div className="opacity-80">
              <HabitCard
                habit={activeHabit}
                currentDate={currentDate}
                onToggle={onToggle}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
