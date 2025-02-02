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
import { HabitPlugin } from '@/ac-components/types';
import type { Habit, PluginHabit } from '@/ac-components/types/habits';
import { PlugIcon, Store } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { PluginCard } from './PluginCard';
import { PluginSettings } from './PluginSettings';

interface PluginManagementProps {
  activeTabStatus?: 'available' | 'enabled';
}

export function PluginManagement({
  activeTabStatus = 'available',
}: PluginManagementProps) {
  const [activeTab, setActiveTab] = useState<string>(activeTabStatus);
  const form = useFormContext(); // Access react-hook-form context
  if (!form.control) {
    throw new Error('Not loaded control');
  }
  const pluginForm: PluginHabit[] = form.getValues('plugins');
  const availablePlugins = pluginManager.getAllPlugins();

  const isPluginEnabled = (pluginId: string) => {
    return pluginForm?.some(p => p.id === pluginId && p.enabled) ?? false;
  };

  const getPluginSettings = (pluginId: string) => {
    return pluginForm?.find(p => p.id === pluginId)?.settings ?? {};
  };

  let handlePluginToggle = (pluginId: string, enabled: boolean) => {
    let plugin = pluginManager.getPlugin(pluginId);
    if (!plugin) return;

    let updatedPlugins = pluginForm ? [...pluginForm] : [];
    let pluginIndex = updatedPlugins.findIndex(p => p.id === pluginId);

    if (pluginIndex === -1 && enabled) {
      // Add the plugin if it's not already in the list
      updatedPlugins.push({
        id: pluginId,
        enabled: true,
        settings: plugin.settings || {},
      });
    } else if (pluginIndex !== -1) {
      // Update the plugin's enabled status
      updatedPlugins[pluginIndex] = { ...updatedPlugins[pluginIndex], enabled };
    }

    form.setValue('plugins', updatedPlugins);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:mt-4">
          <PlugIcon className="mr-2 h-4 w-4" />
          Manage Plugins
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80%]">
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
            <div className="space-y-4">
              {
                <PluginSettings
                  onSettingsChange={(updatedHabitSettings: Habit) => {
                    form.setValue(`plugins`, updatedHabitSettings.plugins);
                    form.setValue(
                      `pluginData`,
                      updatedHabitSettings.pluginData,
                    );
                  }}
                />
              }
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
