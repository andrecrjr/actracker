'use client';

import { usePluginStore } from '@/ac-components/hooks/usePluginStore';
import { formatDate } from '@/ac-components/lib/date-utils';
import type { IPlugin } from '@/ac-components/types/plugin';
import { loadSecureRemotePlugin } from '@/ac-components/utils/secure-plugin-loader';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { AlertCircle, CheckIcon, Download, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { PluginCard } from './PluginCard';
import { PluginStack } from './PluginStack';

interface DailyPluginViewProps {
  currentDate: Date;
}

export function DailyPluginView({ currentDate }: DailyPluginViewProps) {
  const currentDateStr = formatDate(currentDate);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activePlugin, setActivePlugin] = useState<IPlugin | null>(null);
  const [showPluginSelector, setShowPluginSelector] = useState(false);
  const [selectedStack, setSelectedStack] = useState<
    'left' | 'center' | 'right'
  >('center');
  const [isLoadingRemotePlugin, setIsLoadingRemotePlugin] = useState(false);
  const [remotePluginError, setRemotePluginError] = useState<string | null>(
    null,
  );

  const {
    getActivePluginsForDate,
    getPluginDataForDate,
    getStackOrderForDate,
    getAllPlugins,
    activatePlugin,
    deactivatePlugin,
    movePlugin,
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

  const handleDeactivatePlugin = (pluginId: string) => {
    deactivatePlugin(pluginId, currentDateStr);
  };

  const handleUpdatePluginData = (pluginId: string, data: any) => {
    updatePluginData(pluginId, currentDateStr, data);
  };

  const handleAddPlugin = (stackId: 'left' | 'center' | 'right') => {
    setSelectedStack(stackId);
    setShowPluginSelector(true);
    setRemotePluginError(null);
  };

  const handleSelectPlugin = (plugin: IPlugin) => {
    activatePlugin(plugin.id, currentDateStr, selectedStack);
    setShowPluginSelector(false);
  };

  const handleLoadRemoteTodoPlugin = async () => {
    setIsLoadingRemotePlugin(true);
    setRemotePluginError(null);

    try {
      const plugin = await loadSecureRemotePlugin({
        remoteUrl: 'http://localhost:3051/static/remoteEntry.js',
        scope: 'corePlugin',
        module: './TodoPlugin',
        permissions: {
          storage: { maxSize: 1024 * 1024 }, // 1MB
          network: { allowedDomains: [] }, // No network access
          events: {
            canEmit: ['todo:completed', 'todo:added'],
            canSubscribe: ['app:date:changed'],
          },
          ui: {
            maxHeight: 400,
            allowedComponents: ['div', 'span', 'button', 'input', 'checkbox'],
          },
        },
        timeout: 15000, // 15 seconds
      });

      // Register the plugin
      registerPlugin(plugin);

      // Activate it in the selected stack
      activatePlugin(plugin.id, currentDateStr, selectedStack);

      setShowPluginSelector(false);
    } catch (error) {
      console.error('Failed to load remote todoPlugin:', error);
      setRemotePluginError(
        error instanceof Error ? error.message : 'Failed to load remote plugin',
      );
    } finally {
      setIsLoadingRemotePlugin(false);
    }
  };

  const getPluginData = (pluginId: string) => {
    return getPluginDataForDate(pluginId, currentDateStr);
  };

  const availablePlugins = allPlugins.filter(
    plugin => !activePlugins.some(ap => ap.id === plugin.id),
  );

  return (
    <div className="space-y-4">
      {/* Edit Mode Toggle */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditMode(!isEditMode)}
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

      {/* Three-Stack Layout */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PluginStack
            stackId="left"
            plugins={activePlugins}
            pluginOrder={stackOrder.left}
            currentDate={currentDate}
            getPluginData={getPluginData}
            onDeactivatePlugin={handleDeactivatePlugin}
            onUpdatePluginData={handleUpdatePluginData}
            onAddPlugin={handleAddPlugin}
            isEditMode={isEditMode}
          />

          <PluginStack
            stackId="center"
            plugins={activePlugins}
            pluginOrder={stackOrder.center}
            currentDate={currentDate}
            getPluginData={getPluginData}
            onDeactivatePlugin={handleDeactivatePlugin}
            onUpdatePluginData={handleUpdatePluginData}
            onAddPlugin={handleAddPlugin}
            isEditMode={isEditMode}
          />

          <PluginStack
            stackId="right"
            plugins={activePlugins}
            pluginOrder={stackOrder.right}
            currentDate={currentDate}
            getPluginData={getPluginData}
            onDeactivatePlugin={handleDeactivatePlugin}
            onUpdatePluginData={handleUpdatePluginData}
            onAddPlugin={handleAddPlugin}
            isEditMode={isEditMode}
          />
        </div>

        <DragOverlay>
          {activePlugin && (
            <div className="opacity-80">
              <PluginCard
                plugin={activePlugin}
                currentDate={currentDate}
                pluginData={getPluginData(activePlugin.id)}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Enhanced Plugin Selector Dialog */}
      <Dialog open={showPluginSelector} onOpenChange={setShowPluginSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Plugin to{' '}
              {selectedStack.charAt(0).toUpperCase() + selectedStack.slice(1)}{' '}
              Stack
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Remote Plugin Loading Section */}
            <div className="border rounded-lg p-4 bg-muted/20">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Load Remote Plugin
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Load the secure todoPlugin from localhost:3051
              </p>

              {remotePluginError && (
                <Alert variant="destructive" className="mb-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{remotePluginError}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleLoadRemoteTodoPlugin}
                disabled={isLoadingRemotePlugin}
                className="w-full"
              >
                {isLoadingRemotePlugin ? (
                  <>Loading todoPlugin...</>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Load Remote todoPlugin
                  </>
                )}
              </Button>
            </div>

            {/* Local Available Plugins */}
            <div>
              <h4 className="font-medium mb-2">Available Local Plugins</h4>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {availablePlugins.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No available local plugins to add
                  </div>
                ) : (
                  availablePlugins.map(plugin => (
                    <div
                      key={plugin.id}
                      className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted"
                      onClick={() => handleSelectPlugin(plugin)}
                    >
                      <div className="flex items-center gap-2">
                        {plugin.icon && (
                          <div className="text-lg">{plugin.icon}</div>
                        )}
                        <div>
                          <div className="font-medium">{plugin.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {plugin.description}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">v{plugin.version}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
