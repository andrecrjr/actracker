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
  onSettingsChange: (data: any) => void;
  habit?: Habit; // Pass the current habit if needed for RenderHabitForm
}

export function PluginSettings({ onSettingsChange }: PluginSettingsProps) {
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
        const form = (await pluginManager.executeHook(
          'RenderHabitForm',
          currentHabit,
          handleSettingChange,
        )) as React.ReactNode[];
        setPluginForm(form);
      } catch (error) {
        console.error(
          `Error executing RenderHabitForm for plugin ${error}:`,
          error,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPluginForm();
  }, []);

  if (loading) {
    return <div>Loading plugin settings...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Render the custom settings form if available */}
      {pluginForm}
    </div>
  );
}
