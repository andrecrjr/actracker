'use client';

import type { IPlugin } from '@/ac-components/types/plugin';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { SortablePluginCard } from './SortablePluginCard';
import { Button } from './ui/button';

interface PluginStackProps {
  stackId: 'left' | 'center' | 'right';
  plugins: IPlugin[];
  pluginOrder: string[];
  currentDate: Date;
  getPluginData: (pluginId: string) => any;
  onDeactivatePlugin: (pluginId: string) => void;
  onUpdatePluginData: (pluginId: string, data: any) => void;
  onAddPlugin: (stackId: 'left' | 'center' | 'right') => void;
  isEditMode?: boolean;
}

export function PluginStack({
  stackId,
  plugins,
  pluginOrder,
  currentDate,
  getPluginData,
  onDeactivatePlugin,
  onUpdatePluginData,
  onAddPlugin,
  isEditMode = false,
}: PluginStackProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: stackId,
  });

  const stackTitle = {
    left: '',
    center: '',
    right: '',
  };

  // Order plugins according to the pluginOrder array
  const orderedPlugins = pluginOrder
    .map(id => plugins.find(p => p.id === id))
    .filter(plugin => plugin !== undefined) as IPlugin[];

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-colors ${
        isOver ? 'border-primary bg-primary/5' : 'border-muted bg-muted/20'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          {stackTitle[stackId]}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddPlugin(stackId)}
          className="text-muted-foreground hover:text-primary"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <SortableContext
        items={orderedPlugins.map(p => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {orderedPlugins.map(plugin => (
            <SortablePluginCard
              key={plugin.id}
              plugin={plugin}
              currentDate={currentDate}
              pluginData={getPluginData(plugin.id)}
              onDeactivate={onDeactivatePlugin}
              onDataUpdate={onUpdatePluginData}
              isEditMode={isEditMode}
            />
          ))}

          {orderedPlugins.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Drop plugins here or click the + button
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
