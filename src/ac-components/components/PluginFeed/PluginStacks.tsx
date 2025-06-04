import type { IPlugin } from '@/ac-components/types/plugin';
import { DragOverlay } from '@dnd-kit/core';
import { PluginCard } from '../plugins/PluginCard';
import { PluginStack } from '../plugins/PluginStack';

interface PluginStacksProps {
  activePlugins: IPlugin[];
  stackOrder: {
    left: string[];
    center: string[];
    right: string[];
  };
  currentDate: Date;
  getPluginData: (pluginId: string) => any;
  onDeactivatePlugin: (pluginId: string) => void;
  onUpdatePluginData: (pluginId: string, data: any) => void;
  onAddPlugin: (stackId: 'left' | 'center' | 'right') => void;
  isEditMode: boolean;
  activePlugin: IPlugin | null;
}

export function PluginStacks({
  activePlugins,
  stackOrder,
  currentDate,
  getPluginData,
  onDeactivatePlugin,
  onUpdatePluginData,
  onAddPlugin,
  isEditMode,
  activePlugin,
}: PluginStacksProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PluginStack
          stackId="left"
          plugins={activePlugins}
          pluginOrder={stackOrder.left}
          currentDate={currentDate}
          getPluginData={getPluginData}
          onDeactivatePlugin={onDeactivatePlugin}
          onUpdatePluginData={onUpdatePluginData}
          onAddPlugin={onAddPlugin}
          isEditMode={isEditMode}
        />

        <PluginStack
          stackId="center"
          plugins={activePlugins}
          pluginOrder={stackOrder.center}
          currentDate={currentDate}
          getPluginData={getPluginData}
          onDeactivatePlugin={onDeactivatePlugin}
          onUpdatePluginData={onUpdatePluginData}
          onAddPlugin={onAddPlugin}
          isEditMode={isEditMode}
        />

        <PluginStack
          stackId="right"
          plugins={activePlugins}
          pluginOrder={stackOrder.right}
          currentDate={currentDate}
          getPluginData={getPluginData}
          onDeactivatePlugin={onDeactivatePlugin}
          onUpdatePluginData={onUpdatePluginData}
          onAddPlugin={onAddPlugin}
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
    </>
  );
}
