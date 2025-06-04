'use client';

import { usePluginStore } from '@/ac-components/hooks/usePluginStore';
import { formatDate } from '@/ac-components/lib/date-utils';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { EditModeToggle } from './EditModeToggle';
import { PluginSelector } from './PluginSelector';
import { PluginStacks } from './PluginStacks';
import { useDragAndDrop } from './hooks/useDragAndDrop';

interface PluginFeedProps {
  currentDate: Date;
}

export function PluginFeed({ currentDate }: PluginFeedProps) {
  const currentDateStr = formatDate(currentDate);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPluginSelector, setShowPluginSelector] = useState(false);
  const [selectedStack, setSelectedStack] = useState<
    'left' | 'center' | 'right'
  >('center');

  const {
    getActivePluginsForDate,
    getPluginDataForDate,
    getStackOrderForDate,
    getAllPlugins,
    activatePlugin,
    deactivatePlugin,
    updatePluginData,
    registerPlugin,
  } = usePluginStore();

  const activePlugins = getActivePluginsForDate(currentDateStr);
  const allPlugins = getAllPlugins();
  const stackOrder = getStackOrderForDate(currentDateStr);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5, distance: 10 },
    }),
  );

  const { activePlugin, handleDragStart, handleDragOver, handleDragEnd } =
    useDragAndDrop({
      isEditMode,
      activePlugins,
      stackOrder,
      currentDateStr,
    });

  const handleDeactivatePlugin = (pluginId: string) => {
    deactivatePlugin(pluginId, currentDateStr);
  };

  const handleUpdatePluginData = (pluginId: string, data: any) => {
    updatePluginData(pluginId, currentDateStr, data);
  };

  const handleAddPlugin = (stackId: 'left' | 'center' | 'right') => {
    setSelectedStack(stackId);
    setShowPluginSelector(true);
  };

  const handleSelectPlugin = (plugin: any) => {
    activatePlugin(plugin.id, currentDateStr, selectedStack);
    setShowPluginSelector(false);
  };

  const getPluginData = (pluginId: string) => {
    return getPluginDataForDate(pluginId, currentDateStr);
  };

  const availablePlugins = allPlugins.filter(
    plugin => !activePlugins.some(ap => ap.id === plugin.id),
  );

  return (
    <div className="space-y-4">
      <EditModeToggle isEditMode={isEditMode} onToggle={setIsEditMode} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <PluginStacks
          activePlugins={activePlugins}
          stackOrder={stackOrder}
          currentDate={currentDate}
          getPluginData={getPluginData}
          onDeactivatePlugin={handleDeactivatePlugin}
          onUpdatePluginData={handleUpdatePluginData}
          onAddPlugin={handleAddPlugin}
          isEditMode={isEditMode}
          activePlugin={activePlugin}
        />
      </DndContext>

      <PluginSelector
        isOpen={showPluginSelector}
        onClose={() => setShowPluginSelector(false)}
        selectedStack={selectedStack}
        availablePlugins={availablePlugins}
        onSelectPlugin={handleSelectPlugin}
        onRegisterPlugin={registerPlugin}
        currentDateStr={currentDateStr}
      />
    </div>
  );
}
