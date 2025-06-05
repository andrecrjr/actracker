import { formatDate } from '@/ac-components/lib/date-utils';
import type {
  IPlugin,
  PluginPermissions,
  PluginSandbox,
} from '@/ac-components/types/plugin';
import { pluginEventSystem } from './plugin-events';
import { IsolatedPluginStorage } from './plugin-storage';

export const DEFAULT_PERMISSIONS: PluginPermissions = {
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
};

export function createPluginSandbox(
  plugin: IPlugin,
  updatePluginData: (pluginId: string, date: string, data: any) => void,
  getPluginDataForDate: (pluginId: string, date: string) => any,
): PluginSandbox {
  const permissions = plugin.permissions || DEFAULT_PERMISSIONS;
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
        updatePluginData(plugin.id, formatDate(new Date()), data);
      },
      getPluginData: () => {
        return getPluginDataForDate(plugin.id, formatDate(new Date()));
      },
      emitEvent: (event: string, data?: any) => {
        pluginEventSystem.emit(plugin.id, event, data);
      },
      subscribeToEvent: (event: string, callback: (data?: any) => void) => {
        return pluginEventSystem.subscribe(plugin.id, event, callback);
      },
    },
  };
}

export function destroyPluginSandbox(
  pluginId: string,
  permissions: PluginPermissions,
) {
  const storage = new IsolatedPluginStorage(pluginId, permissions);
  storage.clear().catch(console.error);
}
