import { pluginEventSystem } from '@/ac-components/lib/plugin-events';
import {
  DEFAULT_PERMISSIONS,
  createPluginSandbox,
  destroyPluginSandbox,
} from '@/ac-components/lib/plugin-sandbox';
import {
  addPluginToStack,
  initializeDayState,
  normalizeDate,
  removePluginFromStacks,
} from '@/ac-components/lib/plugin-utils';
import type {
  DailyPluginState,
  IPlugin,
  PluginSandbox,
  PluginStore,
} from '@/ac-components/types/plugin';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface EnhancedPluginStore extends PluginStore {
  getSandbox: (pluginId: string) => PluginSandbox | undefined;
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

        const permissions = plugin.permissions || DEFAULT_PERMISSIONS;
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
                stackOrder: removePluginFromStacks(
                  dayState.stackOrder,
                  pluginId,
                ),
              },
            ]),
          ),
        }));

        pluginEventSystem.unregisterPlugin(pluginId);
        const plugin = get().getPlugin(pluginId);
        if (plugin) {
          const permissions = plugin.permissions || DEFAULT_PERMISSIONS;
          destroyPluginSandbox(pluginId, permissions);
        }
      },

      getPlugin: (pluginId: string) => {
        return get().availablePlugins.find(p => p.id === pluginId);
      },

      getAllPlugins: () => {
        return get().availablePlugins;
      },

      getSandbox: (pluginId: string): PluginSandbox | undefined => {
        const plugin = get().getPlugin(pluginId);
        if (!plugin) return undefined;

        return createPluginSandbox(
          plugin,
          get().updatePluginData,
          get().getPluginDataForDate,
        );
      },

      // Daily plugin management
      activatePlugin: (pluginId: string, date: string, stackId = 'center') => {
        const dateStr = normalizeDate(date);

        set(state => {
          const newDailyState = { ...state.dailyState };

          if (!newDailyState[dateStr]) {
            newDailyState[dateStr] = initializeDayState();
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

          // Add to the specified stack
          if (!dayState.stackOrder[stackId].includes(pluginId)) {
            dayState.stackOrder = addPluginToStack(
              dayState.stackOrder,
              pluginId,
              stackId,
            );
          }

          return { dailyState: newDailyState };
        });

        // Execute plugin lifecycle hook
        const plugin = get().getPlugin(pluginId);
        if (plugin?.onActivate) {
          const sandbox = get().getSandbox(pluginId);
          plugin.onActivate(new Date(date), sandbox);
        }
      },

      deactivatePlugin: (pluginId: string, date: string) => {
        const dateStr = normalizeDate(date);

        set(state => {
          const newDailyState = { ...state.dailyState };

          if (newDailyState[dateStr]) {
            const dayState = newDailyState[dateStr];

            dayState.activePlugins = dayState.activePlugins.filter(
              id => id !== pluginId,
            );
            dayState.stackOrder = removePluginFromStacks(
              dayState.stackOrder,
              pluginId,
            );
            delete dayState.pluginData[pluginId];
          }

          return { dailyState: newDailyState };
        });

        // Execute plugin lifecycle hook
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
        const dateStr = normalizeDate(date);

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
        const dateStr = normalizeDate(date);

        set(state => {
          const newDailyState = { ...state.dailyState };

          if (!newDailyState[dateStr]) {
            newDailyState[dateStr] = initializeDayState();
          }

          newDailyState[dateStr].pluginData[pluginId] = data;

          return { dailyState: newDailyState };
        });

        // Execute plugin lifecycle hook
        const plugin = get().getPlugin(pluginId);
        if (plugin?.onDataUpdate) {
          const sandbox = get().getSandbox(pluginId);
          plugin.onDataUpdate(data, sandbox);
        }
      },

      // Getters
      getActivePluginsForDate: (date: string) => {
        const dateStr = normalizeDate(date);
        const dayState = get().dailyState[dateStr];

        if (!dayState) return [];

        return dayState.activePlugins
          .map(id => get().getPlugin(id))
          .filter(plugin => plugin !== undefined) as IPlugin[];
      },

      getPluginDataForDate: (pluginId: string, date: string) => {
        const dateStr = normalizeDate(date);
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
        const dateStr = normalizeDate(date);
        const dayState = get().dailyState[dateStr];

        return dayState?.stackOrder || { left: [], center: [], right: [] };
      },
    }),
    {
      name: 'plugin-store',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        dailyState: state.dailyState,
      }),
    },
  ),
);

export { usePluginStore };
