'use client';

import { HabitForm } from '@/ac-components/components/HabitFormComponent';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ac-components/components/ui/alert-dialog';
import { Badge } from '@/ac-components/components/ui/badge';
import { Button } from '@/ac-components/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
} from '@/ac-components/components/ui/card';
import {
  archiveHabit,
  getActiveHabits,
  getHabitsFromStorage,
  saveHabitsToStorage,
} from '@/ac-components/lib/habits';
import type { Habit } from '@/ac-components/types/habits';
import { useNavigate } from '@modern-js/runtime/router';
import { Archive, ArchiveIcon, ArrowLeft, Box } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitToArchive, setHabitToArchive] = useState<Habit | null>(null);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  const router = useNavigate();

  useEffect(() => {
    const allHabits = getHabitsFromStorage();
    setHabits(getActiveHabits(allHabits));
  }, []);

  const handleArchiveHabit = (habit: Habit) => {
    const allHabits = getHabitsFromStorage();
    const updatedHabits = archiveHabit(allHabits, habit.id);
    saveHabitsToStorage(updatedHabits);
    setHabits(getActiveHabits(updatedHabits));
    setHabitToArchive(null);
  };

  const handleHabitCreate = (newHabit: Habit) => {
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    saveHabitsToStorage(updatedHabits);
  };

  const handleHabitUpdate = (updatedHabit: Habit) => {
    const updatedHabits = habits.map(h =>
      h.id === updatedHabit.id ? updatedHabit : h,
    );
    setHabits(updatedHabits);
    saveHabitsToStorage(updatedHabits);
    // Fechamos o modal
    setHabitToEdit(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Manage Habits</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router('/habits/archived')}
            className="text-muted-foreground"
          >
            <ArchiveIcon className="h-4 w-4" />
            Archived
          </Button>
        </div>
        <HabitForm
          currentDate={new Date()}
          onSave={newHabit => handleHabitCreate(newHabit)}
          buttonClass="w-full"
        />
        <div className="space-y-4 mt-4">
          {habits.map(habit => (
            <Card key={habit.id} className="habit-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex-1">
                  <CardTitle className="text-lg font-medium">
                    {habit.title}
                  </CardTitle>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {habit.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="bg-primary/5">
                      {habit.frequency}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HabitForm
                    habit={habit}
                    currentDate={new Date()}
                    onSave={updatedHabit => handleHabitUpdate(updatedHabit)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Botão para Arquivar */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-muted-foreground/90"
                    onClick={() => setHabitToArchive(habit)}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}

          {habits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No active habits.
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de arquivamento */}
      <AlertDialog
        open={!!habitToArchive}
        onOpenChange={() => setHabitToArchive(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the habit and move it to the archived habits
              list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                habitToArchive && handleArchiveHabit(habitToArchive)
              }
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
