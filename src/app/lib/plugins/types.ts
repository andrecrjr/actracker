import type { Habit } from '@/app/types/habits';

export interface HabitPlugin {
  id: string;
  name: string;
  description?: string;
  version: string;

  // Lifecycle hooks
  onHabitCreate?: (habit: Habit) => Promise<Habit> | Habit;
  onHabitComplete?: (habit: Habit, date: string) => Promise<void>;
  onHabitStreak?: (habit: Habit, streak: number) => Promise<void>;

  // UI extensions
  RenderHabitCard?: (habit: Habit, date: Date) => React.ReactNode;
  RenderHabitForm?: (
    habit: Habit | null,
    handleSettingChange: (habitUpdated: Habit) => void,
  ) => React.ReactNode;

  // Custom settings
  settings?: Record<string, any>;
}

export interface RemoteHabitPlugin
  extends Omit<HabitPlugin, 'id' | 'name' | 'version'> {
  remoteUrl: string; // Remote entry URL
  scope: string; // Module federation scope
  module: string; // Module to load
}

export interface PluginManager {
  registerPlugin: (plugin: HabitPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => HabitPlugin | undefined;
  getAllPlugins: () => HabitPlugin[];
  executeHook: <T>(hookName: keyof HabitPlugin, ...args: any[]) => Promise<T[]>;
  registerRemotePlugin: (plugin: RemoteHabitPlugin) => Promise<void>;
  ensureReady: () => Promise<void>;
}
