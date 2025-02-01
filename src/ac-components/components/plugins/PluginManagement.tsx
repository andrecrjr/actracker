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
  habit?: Habit;
  activeTabStatus?: 'available' | 'enabled';
}

export function PluginManagement({
  habit,
  activeTabStatus = 'available',
}: PluginManagementProps) {
  const [activeTab, setActiveTab] = useState<string>(activeTabStatus);
  const form = useFormContext(); // Access react-hook-form context
  if (!form.control) {
    throw new Error('Not loaded control');
  }
  const pluginForm: PluginHabit[] = form.getValues('plugins');
  const availablePlugins = pluginManager.getAllPlugins();
  console.log('pluginForm', pluginForm);

  const isPluginEnabled = (pluginId: string) => {
    console.log(pluginId);
    return pluginForm?.some(p => p.id === pluginId && p.enabled) ?? false;
  };

  const getPluginSettings = (pluginId: string) => {
    return pluginForm?.find(p => p.id === pluginId)?.settings ?? {};
  };

  const handlePluginToggle = (pluginId: string, enabled: boolean) => {
    const plugin = pluginManager.getPlugin(pluginId);
    if (!plugin) return;
    const updatedPlugins = pluginForm ? [...pluginForm] : [];
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

    // Trigger form update for plugins
    form.setValue(`plugins`, updatedPlugins);
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
            {availablePlugins
              .filter(plugin => {
                console.log(isPluginEnabled(plugin.id), plugin.id);
                return isPluginEnabled(plugin.id);
              })
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
                      onSettingsChange={newSettings => {
                        // Update the form state with new settings
                        console.log('settings', newSettings);
                        // form.setValue(`plugins`, newSettings);
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
