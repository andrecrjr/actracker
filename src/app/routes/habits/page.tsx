import SignOut from '@/ac-components/components/Buttons/SignOut';
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
import { useHabitStore } from '@/ac-components/hooks';
import { getActiveHabits } from '@/ac-components/lib/habits';
import type { Habit } from '@/ac-components/types/habits';
import { Link, useNavigate } from '@modern-js/runtime/router';
import { Archive, ArchiveIcon, ArrowLeft, Box } from 'lucide-react';
import { useState } from 'react';

export default function HabitsPage() {
  const { habits, updateHabit, archiveHabit } = useHabitStore();
  const [habitToArchive, setHabitToArchive] = useState<Habit | null>(null);
  const router = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <section className="flex gap-2">
            <SignOut />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router('/habits/archived')}
              className="text-muted-foreground"
            >
              <ArchiveIcon className="h-4 w-4" />
              Archived
            </Button>
          </section>
        </div>
        <div className="space-y-4 mt-4">
          {getActiveHabits(habits).map(habit => (
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
                    onSave={updatedHabit => updateHabit(updatedHabit)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-muted-foreground/90"
                    onClick={() => archiveHabit(habit.id)}
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
              onClick={() => habitToArchive && archiveHabit(habitToArchive.id)}
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
