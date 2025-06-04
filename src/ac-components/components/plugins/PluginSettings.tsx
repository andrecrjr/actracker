'use client';

// Temporarily disabled - needs update for new plugin system
// import { pluginManager } from '@/ac-components/lib/plugins';
// import type { HabitPlugin } from '@/ac-components/lib/plugins/types';
// import { Habit } from '@/ac-components/types';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
// import { useFormContext } from 'react-hook-form';

interface PluginSettingsProps {
  onSettingsChange: (data: any) => void;
  // habit?: Habit; // Pass the current habit if needed for RenderHabitForm
}

export function PluginSettings({ onSettingsChange }: PluginSettingsProps) {
  // TODO: Update this component to work with the new IPlugin system
  // This component was using the legacy habit plugin system

  return (
    <div className="space-y-4 p-4 text-center text-muted-foreground">
      <p>Plugin Settings is being updated for the new plugin system.</p>
      <p>Individual plugin settings are now available in each plugin card.</p>
    </div>
  );
}
