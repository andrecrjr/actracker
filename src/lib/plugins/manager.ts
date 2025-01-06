import { Habit, PluginHabit } from '@/types';
import { loadRemoteModule } from '@/utils';
import { loadRemote } from '@module-federation/modern-js/runtime';
import type { HabitPlugin, PluginManager, RemoteHabitPlugin } from './types';

class HabitPluginManager implements PluginManager {
  private plugins: Map<string, HabitPlugin> = new Map();
  private isReady = false;
  private loadingPromises: Promise<void>[] = [];

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

    const enabledPlugins = habit.plugins?.filter(
      (habit: PluginHabit) => habit.enabled,
    ) as PluginHabit[];
    if (!enabledPlugins) return [];

    for (const plugin of enabledPlugins) {
      const getPlugin = this.plugins.get(plugin?.id || '');
      if (!getPlugin) continue;

      const hook = getPlugin[hookName];
      if (typeof hook === 'function') {
        try {
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
    const loadingPromise = (async () => {
      try {
        const loadedPlugin = await loadRemoteModule(remoteUrl, scope, module);
        if (!loadedPlugin.id || !loadedPlugin.name) {
          throw new Error('Remote plugin must export an id and name.');
        }
        this.registerPlugin(loadedPlugin);
        console.log(`Remote plugin ${loadedPlugin.id} registered successfully`);
      } catch (error) {
        console.error(
          `Failed to register remote plugin from ${remoteUrl}:`,
          error,
        );
      }
    })();

    this.loadingPromises.push(loadingPromise);
  }

  async ensureReady() {
    if (!this.isReady) {
      await Promise.all(this.loadingPromises);
      this.isReady = true;
    }
  }
}

export const pluginManager = new HabitPluginManager();

(async () => {
  await pluginManager.registerRemotePlugin({
    remoteUrl: 'http://localhost:3051/static/remoteEntry.js',
    scope: 'corePlugin',
    module: './DueDatePlugin',
  });
  await pluginManager.registerRemotePlugin({
    remoteUrl: 'http://localhost:3051/static/remoteEntry.js',
    scope: 'corePlugin',
    module: './NotePlugin',
  });
})();
