import {
  getHabitsFromStorage,
  saveHabitsToStorage,
} from '@/ac-components/lib/habits';
import { FolderSyncIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../ui';

export const SyncButton: React.FC<{ isEditMode?: boolean }> = ({
  isEditMode,
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground"
      onClick={async () => {
        const allHabitTracked = getHabitsFromStorage();
        console.log(allHabitTracked);
      }}
    >
      <FolderSyncIcon className="h-4 w-4" />
    </Button>
  );
};
