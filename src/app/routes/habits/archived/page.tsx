'use client';

import { Badge } from '@/ac-components/components/ui/badge';
import { Button } from '@/ac-components/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/ac-components/components/ui/card';
import { getArchivedHabits, getHabitsFromStorage } from '@/app/lib/habits';
import type { Habit } from '@/app/types/habits';
import { useNavigate } from '@modern-js/runtime/router';
import { ArrowLeft } from 'lucide-react';

import { useEffect, useState } from 'react';

export default function ArchivedHabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const router = useNavigate();

  useEffect(() => {
    const allHabits = getHabitsFromStorage();
    setHabits(getArchivedHabits(allHabits));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router('/habits')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Archived Habits</h1>
        </div>

        <div className="space-y-4">
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
                    <Badge variant="outline" className="bg-secondary/50">
                      Archived on {habit.archiveDate}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {habits.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No archived habits.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
