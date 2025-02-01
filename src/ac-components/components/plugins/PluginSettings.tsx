'use client';

import { Input } from '@/ac-components/components/ui/input';
import { Label } from '@/ac-components/components/ui/label';
import { Switch } from '@/ac-components/components/ui/switch';
import { pluginManager } from '@/ac-components/lib/plugins';
import type { HabitPlugin } from '@/ac-components/lib/plugins/types';
import { Habit } from '@/ac-components/types';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

interface PluginSettingsProps {
  plugin: HabitPlugin;
  settings: Record<string, any>;
  onSettingsChange: (data: any) => void;
  habit?: Habit; // Pass the current habit if needed for RenderHabitForm
}

export function PluginSettings({
  plugin,
  onSettingsChange,
}: PluginSettingsProps) {
  const form = useFormContext(); // Access react-hook-form context
  const currentHabit = form.getValues() as Habit;
  const [pluginForm, setPluginForm] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(true);

  const handleSettingChange = (data: any) => {
    onSettingsChange(data);
  };

  useEffect(() => {
    const fetchPluginForm = async () => {
      try {
        if (plugin.RenderHabitForm) {
          const form = (await pluginManager.executeHook(
            'RenderHabitForm',
            currentHabit,
            handleSettingChange,
          )) as React.ReactNode;
          console.log('comps', form);
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
    console.log(currentHabit, plugin.id);
    fetchPluginForm();
  }, [plugin]);

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
