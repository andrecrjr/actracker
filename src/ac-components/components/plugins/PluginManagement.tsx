'use client';

import { Button } from '@/ac-components/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ac-components/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ac-components/components/ui/tabs';
import { useHabitStore } from '@/ac-components/hooks/useHabitStore';
import { pluginManager } from '@/ac-components/lib/plugins';
import type { Habit } from '@/ac-components/types/habits';
import { PlugIcon, Store } from 'lucide-react';
import { useState } from 'react';
import { PluginCard } from './PluginCard';
import { PluginSettings } from './PluginSettings';

interface PluginMarketplaceProps {
  habit: Habit;
  onHabitUpdate: (updatedHabit: Habit) => void;
  activeTabStatus?: 'available' | 'enabled';
}

export function PluginManagement({
  habit,
  onHabitUpdate,
  activeTabStatus = 'available',
}: PluginMarketplaceProps) {
  const [activeTab, setActiveTab] = useState<string>(activeTabStatus);
  const { getCurrentHabitById } = useHabitStore();
  const availablePlugins = pluginManager.getAllPlugins();

  const isPluginEnabled = (pluginId: string) => {
    return habit?.plugins?.some(p => p.id === pluginId && p.enabled) ?? false;
  };

  const getPluginSettings = (pluginId: string) => {
    return habit?.plugins?.find(p => p.id === pluginId)?.settings ?? {};
  };

  const handlePluginToggle = (pluginId: string, enabled: boolean) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (!plugin) return;

    const updatedPlugins = habit?.plugins ? [...habit.plugins] : [];
    const pluginIndex = updatedPlugins.findIndex(p => p.id === pluginId);

    if (pluginIndex === -1 && enabled) {
      // Enable the plugin if it doesn't already exist
      updatedPlugins.push({
        id: pluginId,
        enabled: true,
        settings: plugin.settings || {}, // Use default settings
      });
    } else if (pluginIndex !== -1) {
      // Update the plugin's `enabled` state
      updatedPlugins[pluginIndex] = {
        ...updatedPlugins[pluginIndex],
        enabled,
      };
    }

    if (habit) {
      onHabitUpdate({
        ...habit,
        plugins: updatedPlugins,
      });
    }
  };

  const handleSettingsChange = (pluginId: string, habit: Habit) => {
    console.log('new hab', habit);
    const updatedHabit =
      getCurrentHabitById(habit?.id || '') || (habit as Habit);
    const updatedPlugins = updatedHabit?.plugins
      ? [...updatedHabit.plugins]
      : [];
    const pluginIndex = updatedPlugins.findIndex(p => p.id === pluginId);

    if (pluginIndex !== -1) {
      // Update settings for the specified plugin
      updatedPlugins[pluginIndex] = {
        ...updatedPlugins[pluginIndex],
        ...habit,
      };

      if (habit) {
        onHabitUpdate({
          ...updatedHabit,
          ...habit,
        });
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:mt-4">
          <PlugIcon className="mr-2 h-4 w-4" />
          Manage Plugins
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Plugin Management</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="enabled">Enabled</TabsTrigger>
          </TabsList>

          <TabsContent
            value="available"
            className="space-y-4 max-h-[400px] overflow-y-auto"
          >
            {availablePlugins.map(plugin => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                isEnabled={isPluginEnabled(plugin.id)}
                onToggle={enabled => handlePluginToggle(plugin.id, enabled)}
              />
            ))}
          </TabsContent>

          <TabsContent
            value="enabled"
            className="space-y-4 max-h-[400px] overflow-y-auto"
          >
            <Button variant={'default'}>Save Plugin Config</Button>
            {availablePlugins
              .filter(plugin => isPluginEnabled(plugin.id))
              .map(plugin => (
                <div key={plugin.id} className="space-y-4">
                  <PluginCard
                    plugin={plugin}
                    isEnabled={true}
                    onToggle={enabled => handlePluginToggle(plugin.id, enabled)}
                  />
                  {plugin.settings && (
                    <PluginSettings
                      plugin={plugin}
                      settings={getPluginSettings(plugin.id)}
                      onSettingsChange={newHabit => {
                        handleSettingsChange(plugin.id, newHabit as Habit);
                      }}
                      habit={habit}
                    />
                  )}
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
