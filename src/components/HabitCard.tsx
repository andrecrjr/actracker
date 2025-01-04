'use client';

import { formatDate } from '@/lib/date-utils';
import { pluginManager } from '@/lib/plugins';
import { calculateStreak, isHabitActiveForDate } from '@/lib/streak-utils';
import { cn } from '@/lib/utils';
import type { Habit } from '@/types/habits';
import { CheckCircle2, Circle, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface HabitCardProps {
  habit: Habit;
  currentDate: Date;
  onToggle: (habitId: string, date: string) => void;
}

export function HabitCard({ habit, currentDate, onToggle }: HabitCardProps) {
  const dateStr = formatDate(currentDate);
  const [pluginContent, setPluginContent] = useState<JSX.Element[]>([]);
  const isCompleted = habit.completedDates.includes(dateStr);
  const isActive = isHabitActiveForDate(habit, dateStr);
  const streak = calculateStreak(habit, dateStr);

  useEffect(() => {
    const fetchPluginContent = async () => {
      const content = (await pluginManager.executeHook(
        'RenderHabitCard',
        habit,
        currentDate,
      )) as JSX.Element[];
      setPluginContent(content);
    };

    fetchPluginContent();
  }, [habit, currentDate]);

  if (!isActive) return null;

  return (
    <Card
      className={cn(
        'habit-card border-2',
        isCompleted ? 'border-primary/50' : 'border-border',
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">{habit.title}</CardTitle>
            {streak > 0 && (
              <Badge
                variant="secondary"
                className="streak-badge flex items-center gap-1"
              >
                <Flame className="h-3 w-3" />
                {streak} day streak
              </Badge>
            )}
          </div>
          {habit.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {habit.description}
            </p>
          )}
          {pluginContent.length > 0 &&
            pluginContent.map((content, index) => (
              <div key={content.key} className="w-full pt-2">
                {content}
              </div>
            ))}
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="bg-primary/5">
              {habit.frequency}
            </Badge>
          </div>
        </div>

        <button
          onClick={() => onToggle(habit.id, dateStr)}
          className="focus:outline-none transform transition-transform hover:scale-110"
        >
          {isCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-primary" />
          ) : (
            <Circle className="h-6 w-6 text-muted-foreground/50" />
          )}
        </button>
      </CardHeader>
    </Card>
  );
}
