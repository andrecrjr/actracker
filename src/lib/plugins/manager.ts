import type { Habit, PluginHabit } from '@/app/types/habits';
import { notesPlugin, reminderPlugin } from '@/lib/plugins/core';
import { dateRangePlugin } from './core/dateRangePlugin';
import type { HabitPlugin, PluginManager } from './types';

class HabitPluginManager implements PluginManager {
  private plugins: Map<string, HabitPlugin> = new Map();

  registerPlugin(plugin: HabitPlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id ${plugin.id} is already registered`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  unregisterPlugin(pluginId: string): void {
    this.plugins.delete(pluginId);
  }

  getPlugin(pluginId: string): HabitPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAllPlugins(): HabitPlugin[] {
    return Array.from(this.plugins.values());
  }

  async executeHook<T>(
    hookName: keyof HabitPlugin,
    habit: Habit,
    ...args: any[]
  ): Promise<T[]> {
    const results: T[] = [];
    if (!habit) {
      console.log('No plugins enabled');
      return results;
    }
    // Filter plugins by the `enabled` key
    const enabledPlugins = habit.plugins?.filter(
      (habit: Habit) => habit.enabled,
    ) as PluginHabit[];
    if (!enabledPlugins) return [];
    for (const plugin of enabledPlugins) {
      const getPlugin = this.plugins.get(plugin?.id || '');
      if (!getPlugin) {
        return results;
      }
      const hook = getPlugin[hookName];
      if (typeof hook === 'function') {
        try {
          //@ts-ignore
          const result = await hook.apply(plugin, [habit, ...args]);
          if (result !== undefined) {
            results.push(result);
          }
        } catch (error) {
          console.error(
            `Error executing ${hookName} in plugin ${plugin.id}:`,
            error,
          );
        }
      }
    }

    return results;
  }
}

export const pluginManager = new HabitPluginManager();

pluginManager.registerPlugin(reminderPlugin);
pluginManager.registerPlugin(notesPlugin);
pluginManager.registerPlugin(dateRangePlugin);
