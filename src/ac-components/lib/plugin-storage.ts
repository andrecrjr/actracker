import type {
  PluginPermissions,
  PluginStorageAPI,
} from '@/ac-components/types/plugin';

export class IsolatedPluginStorage implements PluginStorageAPI {
  private pluginId: string;
  private permissions: PluginPermissions;
  private storagePrefix: string;

  constructor(pluginId: string, permissions: PluginPermissions) {
    this.pluginId = pluginId;
    this.permissions = permissions;
    this.storagePrefix = `plugin:${pluginId}:`;
  }

  private getStorageKey(key: string): string {
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
