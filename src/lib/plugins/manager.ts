import { notesPlugin, reminderPlugin } from '@/lib/plugins/core';
import type { Habit, PluginHabit } from '@/types/habits';
import { loadRemoteModule } from '@/utils';
import { dateRangePlugin } from './core/dateRangePlugin';
import type { HabitPlugin, PluginManager, RemoteHabitPlugin } from './types';

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
  async registerRemotePlugin(plugin: RemoteHabitPlugin): Promise<void> {
    const { remoteUrl, scope, module } = plugin;
    try {
      const loadedPlugin = await loadRemoteModule(remoteUrl, scope, module);
      if (!loadedPlugin.id || !loadedPlugin.name) {
        throw new Error('Remote plugin must export an id and name.');
      }
      console.log(loadedPlugin);
      this.registerPlugin({ ...loadedPlugin });
      console.log(`Remote plugin ${loadedPlugin.id} registered successfully`);
    } catch (error) {
      console.error(
        `Failed to register remote plugin from ${remoteUrl}:`,
        error,
      );
    }
  }
}

export const pluginManager = new HabitPluginManager();

// pluginManager.registerPlugin(reminderPlugin);
//pluginManager.registerPlugin(notesPlugin);
// pluginManager.registerPlugin(dateRangePlugin);

(async () => {
  //CORE PLUGINS

  //dateRangePlugin
  await pluginManager.registerRemotePlugin({
    remoteUrl: 'http://localhost:3051/remoteEntry.js',
    scope: 'corePlugin',
    module: './DueDatePlugin',
  });
  // await pluginManager.registerRemotePlugin({
  //   remoteUrl: 'http://localhost:8082/remoteEntry.js',
  //   scope: 'notesPlugin',
  //   module: './NotesPlugin',
  // });
})();
