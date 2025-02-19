import { useAuth } from '@/ac-components/hooks/useAuth';
import { getHabitsFromStorage } from '@/ac-components/lib/habits';
import axiosInstance from '@/ac-components/utils/axios';
import { FolderSyncIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../../ui';

export const SyncButton: React.FC<{ isEditMode?: boolean }> = () => {
  const data = useAuth();
  if (data.isAuthenticated)
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={async () => {
          const allHabitTracked = getHabitsFromStorage();
          await axiosInstance.post('/habit/sync', {
            habits: allHabitTracked,
          });
        }}
      >
        <FolderSyncIcon className="h-4 w-4" />
      </Button>
    );

  return <></>;
};
