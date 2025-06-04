import { formatDate } from '@/ac-components/lib/date-utils';
import type {
  DailyPluginState,
  IPlugin,
  PluginStore,
} from '@/ac-components/types/plugin';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const usePluginStore = create<PluginStore>()(
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
      },

      getPlugin: (pluginId: string) => {
        return get().availablePlugins.find(p => p.id === pluginId);
      },

      getAllPlugins: () => {
        return get().availablePlugins;
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

        // Execute plugin onActivate hook
        const plugin = get().getPlugin(pluginId);
        if (plugin?.onActivate) {
          plugin.onActivate(new Date(date));
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

        // Execute plugin onDeactivate hook
        const plugin = get().getPlugin(pluginId);
        if (plugin?.onDeactivate) {
          plugin.onDeactivate(new Date(date));
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

        // Execute plugin onDataUpdate hook
        const plugin = get().getPlugin(pluginId);
        if (plugin?.onDataUpdate) {
          plugin.onDataUpdate(data);
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
