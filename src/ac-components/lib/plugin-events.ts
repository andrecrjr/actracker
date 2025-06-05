import type { PluginPermissions } from '@/ac-components/types/plugin';

export class PluginEventSystem {
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

// Singleton instance
export const pluginEventSystem = new PluginEventSystem();
