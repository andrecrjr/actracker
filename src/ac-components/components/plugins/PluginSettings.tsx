'use client';

import { Input } from '@/ac-components/components/ui/input';
import { Label } from '@/ac-components/components/ui/label';
import { Switch } from '@/ac-components/components/ui/switch';
import { pluginManager } from '@/app/lib/plugins';
import type { HabitPlugin } from '@/app/lib/plugins/types';
import type React from 'react';
import { useEffect, useState } from 'react';

interface PluginSettingsProps {
  plugin: HabitPlugin;
  settings: Record<string, any>;
  onSettingsChange: (data: any) => void;
  habit?: any; // Pass the current habit if needed for RenderHabitForm
}

export function PluginSettings({
  plugin,
  settings,
  onSettingsChange,
  habit,
}: PluginSettingsProps) {
  const [pluginForm, setPluginForm] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(true);

  const handleSettingChange = (data: any) => {
    onSettingsChange({ ...habit, ...data });
  };

  useEffect(() => {
    const fetchPluginForm = async () => {
      try {
        if (plugin.RenderHabitForm) {
          const form = (await pluginManager.executeHook(
            'RenderHabitForm',
            habit,
            handleSettingChange,
          )) as React.ReactNode;
          setPluginForm(form);
        } else {
          setPluginForm(null); // No custom form provided
        }
      } catch (error) {
        console.error(
          `Error executing RenderHabitForm for plugin ${plugin.id}:`,
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPluginForm();
  }, [plugin, habit]);

  if (loading) {
    return <div>Loading plugin settings...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Render the custom form if available */}
      {pluginForm}
    </div>
  );
}
