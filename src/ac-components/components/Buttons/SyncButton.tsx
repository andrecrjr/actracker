import { useHabitStore } from '@/ac-components/hooks';
import { useAuth } from '@/ac-components/hooks/useAuth';
import { getHabitsFromStorage } from '@/ac-components/lib/habits';
import axiosInstance from '@/ac-components/utils/axios';
import { FolderSyncIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../ui';

export const SyncButton: React.FC<{ isEditMode?: boolean }> = () => {
  const data = useAuth();
  const { habits } = useHabitStore();
  if (data.isAuthenticated)
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={async () => {
          await axiosInstance.post('/habit/sync', {
            habits: habits.filter(item => !item.cloudSync),
          });
        }}
      >
        <FolderSyncIcon className="h-4 w-4" />
      </Button>
    );

  return <></>;
};
