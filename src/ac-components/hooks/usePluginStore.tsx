import { formatDate } from '@/ac-components/lib/date-utils';
import type {
  DailyPluginState,
  IPlugin,
  PluginPermissions,
  PluginSandbox,
  PluginStorageAPI,
  PluginStore,
} from '@/ac-components/types/plugin';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Plugin-specific storage implementation
class IsolatedPluginStorage implements PluginStorageAPI {
  private pluginId: string;
  private permissions: PluginPermissions;
  private storagePrefix: string;

  constructor(pluginId: string, permissions: PluginPermissions) {
    this.pluginId = pluginId;
    this.permissions = permissions;
    this.storagePrefix = `plugin:${pluginId}:`;
  }

  private getStorageKey(key: string): string {
    // Validate key against permissions
    if (this.permissions.storage.allowedKeys) {
      if (!this.permissions.storage.allowedKeys.includes(key)) {
        throw new Error(
          `Plugin ${this.pluginId} is not allowed to access key: ${key}`,
        );
      }
    }
    return `${this.storagePrefix}${key}`;
  }

  private checkStorageSize(value: any): void {
    const serialized = JSON.stringify(value);
    const size = new Blob([serialized]).size;

    // Check current usage
    const currentUsage = this.getCurrentStorageUsage();
    if (currentUsage + size > this.permissions.storage.maxSize) {
      throw new Error(
        `Plugin ${this.pluginId} storage quota exceeded. Max: ${this.permissions.storage.maxSize} bytes`,
      );
    }
  }

  private getCurrentStorageUsage(): number {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
    }
    return totalSize;
  }

  async get(key: string): Promise<any> {
    try {
      const storageKey = this.getStorageKey(key);
      const value = localStorage.getItem(storageKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Plugin ${this.pluginId} storage get error:`, error);
      throw error;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      this.checkStorageSize(value);
      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Plugin ${this.pluginId} storage set error:`, error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const storageKey = this.getStorageKey(key);
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Plugin ${this.pluginId} storage remove error:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error(`Plugin ${this.pluginId} storage clear error:`, error);
      throw error;
    }
  }

  async keys(): Promise<string[]> {
    try {
      const pluginKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.storagePrefix)) {
          // Remove the prefix to return the original key
          pluginKeys.push(key.replace(this.storagePrefix, ''));
        }
      }
      return pluginKeys;
    } catch (error) {
      console.error(`Plugin ${this.pluginId} storage keys error:`, error);
      throw error;
    }
  }
}

// Plugin event system for inter-plugin communication
class PluginEventSystem {
  private listeners: Map<string, Set<(data?: any) => void>> = new Map();
  private permissions: Map<string, PluginPermissions> = new Map();

  registerPlugin(pluginId: string, permissions: PluginPermissions) {
    this.permissions.set(pluginId, permissions);
  }

  unregisterPlugin(pluginId: string) {
    this.permissions.delete(pluginId);
    // Remove all listeners for this plugin
    this.listeners.forEach((listeners, event) => {
      listeners.forEach(listener => {
        if ((listener as any).__pluginId === pluginId) {
          listeners.delete(listener);
        }
      });
    });
  }

  emit(pluginId: string, event: string, data?: any) {
    const permissions = this.permissions.get(pluginId);
    if (!permissions?.events.canEmit.includes(event)) {
      throw new Error(
        `Plugin ${pluginId} is not allowed to emit event: ${event}`,
      );
    }

    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  subscribe(
    pluginId: string,
    event: string,
    callback: (data?: any) => void,
  ): () => void {
    const permissions = this.permissions.get(pluginId);
    if (!permissions?.events.canSubscribe.includes(event)) {
      throw new Error(
        `Plugin ${pluginId} is not allowed to subscribe to event: ${event}`,
      );
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    // Mark the callback with the plugin ID for cleanup
    (callback as any).__pluginId = pluginId;
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }
}

const pluginEventSystem = new PluginEventSystem();

// Enhanced plugin store with privacy features
interface EnhancedPluginStore extends PluginStore {
  // Plugin sandbox management
  createSandbox: (plugin: IPlugin) => PluginSandbox;
  destroySandbox: (pluginId: string) => void;
  getSandbox: (pluginId: string) => PluginSandbox | undefined;

  // Plugin data isolation
  getIsolatedPluginData: (pluginId: string, date: string) => any;
  setIsolatedPluginData: (pluginId: string, date: string, data: any) => void;

  // Default permissions
  getDefaultPermissions: () => PluginPermissions;
}

const usePluginStore = create<EnhancedPluginStore>()(
  persist(
    (set, get) => ({
      availablePlugins: [],
      dailyState: {},

      // Plugin management
      registerPlugin: (plugin: IPlugin) => {
        set(state => ({
          availablePlugins: [
            ...state.availablePlugins.filter(p => p.id !== plugin.id),
            plugin,
          ],
        }));

        // Register plugin in event system
        const permissions = plugin.permissions || get().getDefaultPermissions();
        pluginEventSystem.registerPlugin(plugin.id, permissions);
      },

      unregisterPlugin: (pluginId: string) => {
        set(state => ({
          availablePlugins: state.availablePlugins.filter(
            p => p.id !== pluginId,
          ),
          dailyState: Object.fromEntries(
            Object.entries(state.dailyState).map(([date, dayState]) => [
              date,
              {
                ...dayState,
                activePlugins: dayState.activePlugins.filter(
                  id => id !== pluginId,
                ),
                pluginData: Object.fromEntries(
                  Object.entries(dayState.pluginData).filter(
                    ([id]) => id !== pluginId,
                  ),
                ),
                stackOrder: {
                  left: dayState.stackOrder.left.filter(id => id !== pluginId),
                  center: dayState.stackOrder.center.filter(
                    id => id !== pluginId,
                  ),
                  right: dayState.stackOrder.right.filter(
                    id => id !== pluginId,
                  ),
                },
              },
            ]),
          ),
        }));

        // Unregister from event system and clean up isolated storage
        pluginEventSystem.unregisterPlugin(pluginId);
        get().destroySandbox(pluginId);
      },

      getPlugin: (pluginId: string) => {
        return get().availablePlugins.find(p => p.id === pluginId);
      },

      getAllPlugins: () => {
        return get().availablePlugins;
      },

      getDefaultPermissions: (): PluginPermissions => ({
        storage: {
          maxSize: 5 * 1024 * 1024, // 5MB default
        },
        network: {
          maxRequests: 100, // per minute
        },
        events: {
          canEmit: ['plugin:data:updated'],
          canSubscribe: ['app:date:changed', 'plugin:data:updated'],
        },
        ui: {
          maxHeight: 500,
        },
      }),

      // Sandbox management
      createSandbox: (plugin: IPlugin): PluginSandbox => {
        const permissions = plugin.permissions || get().getDefaultPermissions();
        const storage = new IsolatedPluginStorage(plugin.id, permissions);

        return {
          storage,
          pluginId: plugin.id,
          metadata: {
            name: plugin.name,
            version: plugin.version,
            permissions,
          },
          hostAPI: {
            updatePluginData: (data: any) => {
              get().updatePluginData(plugin.id, formatDate(new Date()), data);
            },
            getPluginData: () => {
              return get().getPluginDataForDate(
                plugin.id,
                formatDate(new Date()),
              );
            },
            emitEvent: (event: string, data?: any) => {
              pluginEventSystem.emit(plugin.id, event, data);
            },
            subscribeToEvent: (
              event: string,
              callback: (data?: any) => void,
            ) => {
              return pluginEventSystem.subscribe(plugin.id, event, callback);
            },
          },
        };
      },

      destroySandbox: (pluginId: string) => {
        const permissions =
          get().getPlugin(pluginId)?.permissions ||
          get().getDefaultPermissions();
        const storage = new IsolatedPluginStorage(pluginId, permissions);
        storage.clear().catch(console.error);
      },

      getSandbox: (pluginId: string): PluginSandbox | undefined => {
        const plugin = get().getPlugin(pluginId);
        if (!plugin) return undefined;
        return get().createSandbox(plugin);
      },

      // Daily plugin management
      activatePlugin: (pluginId: string, date: string, stackId = 'center') => {
        const dateStr =
          typeof date === 'string' ? date : formatDate(new Date(date));

        set(state => {
          const newDailyState = { ...state.dailyState };

          if (!newDailyState[dateStr]) {
            newDailyState[dateStr] = {
              activePlugins: [],
              pluginData: {},
              stackOrder: { left: [], center: [], right: [] },
            };
          }

          const dayState = newDailyState[dateStr];

          // Add to active plugins if not already active
          if (!dayState.activePlugins.includes(pluginId)) {
            dayState.activePlugins.push(pluginId);
          }

          // Initialize plugin data with default data if not exists
          if (!dayState.pluginData[pluginId]) {
            const plugin = get().getPlugin(pluginId);
            if (plugin?.data) {
              dayState.pluginData[pluginId] = { ...plugin.data };
            }
          }

          // Add to the specified stack if not already there
          if (!dayState.stackOrder[stackId].includes(pluginId)) {
            // Remove from other stacks first
            dayState.stackOrder.left = dayState.stackOrder.left.filter(
              id => id !== pluginId,
            );
            dayState.stackOrder.center = dayState.stackOrder.center.filter(
              id => id !== pluginId,
            );
            dayState.stackOrder.right = dayState.stackOrder.right.filter(
              id => id !== pluginId,
            );

            // Add to the target stack
            dayState.stackOrder[stackId].push(pluginId);
          }

          return { dailyState: newDailyState };
        });

        // Execute plugin onActivate hook with sandbox
        const plugin = get().getPlugin(pluginId);
        if (plugin?.onActivate) {
          const sandbox = get().getSandbox(pluginId);
          plugin.onActivate(new Date(date), sandbox);
        }
      },

      deactivatePlugin: (pluginId: string, date: string) => {
        const dateStr =
          typeof date === 'string' ? date : formatDate(new Date(date));

        set(state => {
          const newDailyState = { ...state.dailyState };

          if (newDailyState[dateStr]) {
            const dayState = newDailyState[dateStr];

            // Remove from active plugins
            dayState.activePlugins = dayState.activePlugins.filter(
              id => id !== pluginId,
            );

            // Remove from all stacks
            dayState.stackOrder.left = dayState.stackOrder.left.filter(
              id => id !== pluginId,
            );
            dayState.stackOrder.center = dayState.stackOrder.center.filter(
              id => id !== pluginId,
            );
            dayState.stackOrder.right = dayState.stackOrder.right.filter(
              id => id !== pluginId,
            );

            // Remove plugin data
            delete dayState.pluginData[pluginId];
          }

          return { dailyState: newDailyState };
        });

        // Execute plugin onDeactivate hook with sandbox
        const plugin = get().getPlugin(pluginId);
        if (plugin?.onDeactivate) {
          const sandbox = get().getSandbox(pluginId);
          plugin.onDeactivate(new Date(date), sandbox);
        }
      },

      movePlugin: (
        pluginId: string,
        date: string,
        fromStack: string,
        toStack: string,
        newOrder: number,
      ) => {
        const dateStr =
          typeof date === 'string' ? date : formatDate(new Date(date));

        set(state => {
          const newDailyState = { ...state.dailyState };

          if (newDailyState[dateStr]) {
            const dayState = newDailyState[dateStr];

            // Remove from source stack
            if (fromStack in dayState.stackOrder) {
              dayState.stackOrder[
                fromStack as keyof typeof dayState.stackOrder
              ] = dayState.stackOrder[
                fromStack as keyof typeof dayState.stackOrder
              ].filter(id => id !== pluginId);
            }

            // Add to target stack at specified position
            if (toStack in dayState.stackOrder) {
              const targetStack =
                dayState.stackOrder[
                  toStack as keyof typeof dayState.stackOrder
                ];
              targetStack.splice(newOrder, 0, pluginId);
            }
          }

          return { dailyState: newDailyState };
        });
      },

      updatePluginData: (pluginId: string, date: string, data: any) => {
        const dateStr =
          typeof date === 'string' ? date : formatDate(new Date(date));

        set(state => {
          const newDailyState = { ...state.dailyState };

          if (!newDailyState[dateStr]) {
            newDailyState[dateStr] = {
              activePlugins: [],
              pluginData: {},
              stackOrder: { left: [], center: [], right: [] },
            };
          }

          newDailyState[dateStr].pluginData[pluginId] = data;

          return { dailyState: newDailyState };
        });

        // Execute plugin onDataUpdate hook with sandbox
        const plugin = get().getPlugin(pluginId);
        if (plugin?.onDataUpdate) {
          const sandbox = get().getSandbox(pluginId);
          plugin.onDataUpdate(data, sandbox);
        }
      },

      // Getters
      getActivePluginsForDate: (date: string) => {
        const dateStr =
          typeof date === 'string' ? date : formatDate(new Date(date));
        const dayState = get().dailyState[dateStr];

        if (!dayState) return [];

        return dayState.activePlugins
          .map(id => get().getPlugin(id))
          .filter(plugin => plugin !== undefined) as IPlugin[];
      },

      getPluginDataForDate: (pluginId: string, date: string) => {
        const dateStr =
          typeof date === 'string' ? date : formatDate(new Date(date));
        const dayState = get().dailyState[dateStr];

        // First try to get date-specific data
        const dateSpecificData = dayState?.pluginData[pluginId];
        if (dateSpecificData) {
          return dateSpecificData;
        }

        // Fall back to plugin's default data
        const plugin = get().getPlugin(pluginId);
        return plugin?.data || null;
      },

      getStackOrderForDate: (date: string) => {
        const dateStr =
          typeof date === 'string' ? date : formatDate(new Date(date));
        const dayState = get().dailyState[dateStr];

        return dayState?.stackOrder || { left: [], center: [], right: [] };
      },

      // Enhanced data isolation methods
      getIsolatedPluginData: (pluginId: string, date: string) => {
        const dateStr =
          typeof date === 'string' ? date : formatDate(new Date(date));
        const dayState = get().dailyState[dateStr];

        // Only return data for the requesting plugin
        return dayState?.pluginData[pluginId] || null;
      },

      setIsolatedPluginData: (pluginId: string, date: string, data: any) => {
        get().updatePluginData(pluginId, date, data);
      },
    }),
    {
      name: 'plugin-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Only persist the daily state, not the plugins themselves
        // (since they contain functions that can't be serialized)
        dailyState: state.dailyState,
      }),
    },
  ),
);

export { usePluginStore };
