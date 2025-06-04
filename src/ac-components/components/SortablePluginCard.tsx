'use client';

import type { IPlugin } from '@/ac-components/types/plugin';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { PluginCard } from './PluginCard';

interface SortablePluginCardProps {
  plugin: IPlugin;
  currentDate: Date;
  pluginData?: any;
  onDeactivate?: (pluginId: string) => void;
  onDataUpdate?: (pluginId: string, data: any) => void;
  isEditMode?: boolean;
}

export function SortablePluginCard({
  plugin,
  currentDate,
  pluginData,
  onDeactivate,
  onDataUpdate,
  isEditMode = false,
}: SortablePluginCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: plugin.id,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandle = isEditMode ? (
    <div
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  ) : null;

  return (
    <div ref={setNodeRef} style={style}>
      <PluginCard
        plugin={plugin}
        currentDate={currentDate}
        pluginData={pluginData}
        onDeactivate={onDeactivate}
        onDataUpdate={onDataUpdate}
        isDragging={isDragging}
        dragHandle={dragHandle}
      />
    </div>
  );
}
