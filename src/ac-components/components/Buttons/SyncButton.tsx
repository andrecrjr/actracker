import { useHabitStore } from '@/ac-components/hooks';
import { useAuth } from '@/ac-components/hooks/useAuth';
import { saveSyncCloud } from '@/ac-components/service';
import { FolderSyncIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../ui';

export const SyncButton: React.FC<{ isEditMode?: boolean }> = () => {
  const data = useAuth();
  const { habits, syncHabits } = useHabitStore();
  if (data.isAuthenticated)
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={async () => {
          try {
            saveSyncCloud(habits);
            syncHabits();
          } catch (error) {
            throw new Error(
              'Problem to sync with cloud, please try again later',
            );
          }
        }}
      >
        <FolderSyncIcon className="h-4 w-4" />
      </Button>
    );

  return <></>;
};
