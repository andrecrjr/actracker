import { CheckIcon, PencilIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface EditModeToggleProps {
  isEditMode: boolean;
  onToggle: (isEditMode: boolean) => void;
}

export function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
  return (
    <div className="flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(!isEditMode)}
        className="text-muted-foreground"
      >
        {isEditMode ? (
          <>
            <CheckIcon className="h-4 w-4 mr-2" /> Done
          </>
        ) : (
          <>
            <PencilIcon className="h-4 w-4 mr-2" /> Edit
          </>
        )}
      </Button>
    </div>
  );
}
