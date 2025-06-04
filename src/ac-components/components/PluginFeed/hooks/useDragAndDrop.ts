import { usePluginStore } from '@/ac-components/hooks/usePluginStore';
import type { IPlugin } from '@/ac-components/types/plugin';
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';

interface UseDragAndDropProps {
  isEditMode: boolean;
  activePlugins: IPlugin[];
  stackOrder: {
    left: string[];
    center: string[];
    right: string[];
  };
  currentDateStr: string;
}

export function useDragAndDrop({
  isEditMode,
  activePlugins,
  stackOrder,
  currentDateStr,
}: UseDragAndDropProps) {
  const [activePlugin, setActivePlugin] = useState<IPlugin | null>(null);
  const { movePlugin } = usePluginStore();

  const handleDragStart = (event: DragStartEvent) => {
    if (!isEditMode) return;
    const { active } = event;
    const draggedPlugin = activePlugins.find(plugin => plugin.id === active.id);
    setActivePlugin(draggedPlugin || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over for visual feedback if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isEditMode) return;

    const { active, over } = event;
    setActivePlugin(null);

    if (!over) return;

    const activePluginId = active.id as string;
    const overContainer = over.id as string;

    // Check if dropping on a stack
    if (['left', 'center', 'right'].includes(overContainer)) {
      // Find which stack the plugin is currently in
      let fromStack = '';
      Object.entries(stackOrder).forEach(([stack, plugins]) => {
        if (plugins.includes(activePluginId)) {
          fromStack = stack;
        }
      });

      if (fromStack && fromStack !== overContainer) {
        // Moving to a different stack
        const newOrder =
          stackOrder[overContainer as keyof typeof stackOrder].length;
        movePlugin(
          activePluginId,
          currentDateStr,
          fromStack,
          overContainer,
          newOrder,
        );
      }
    } else {
      // Reordering within the same stack
      const overPluginId = over.id as string;

      // Find which stacks both plugins are in
      let fromStack = '';
      let toStack = '';
      let newOrder = 0;

      Object.entries(stackOrder).forEach(([stack, plugins]) => {
        if (plugins.includes(activePluginId)) {
          fromStack = stack;
        }
        if (plugins.includes(overPluginId)) {
          toStack = stack;
          newOrder = plugins.indexOf(overPluginId);
        }
      });

      if (fromStack === toStack && activePluginId !== overPluginId) {
        movePlugin(
          activePluginId,
          currentDateStr,
          fromStack,
          toStack,
          newOrder,
        );
      }
    }
  };

  return {
    activePlugin,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
