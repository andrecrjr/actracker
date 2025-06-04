export type PluginPosition = {
  stackId: 'left' | 'center' | 'right';
  order: number;
};

export interface IPlugin {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon?: string;
  color?: string;

  // Date-based state
  isActive: boolean;
  data?: Record<string, any>; // Plugin-specific data
  settings?: Record<string, any>; // Plugin configuration

  // Position for drag & drop
  position?: PluginPosition;

  // UI rendering
  renderContent?: (date: Date, data?: any) => React.ReactNode;
  renderSettings?: () => React.ReactNode;

  // Lifecycle hooks
  onDateChange?: (date: Date) => Promise<void> | void;
  onActivate?: (date: Date) => Promise<void> | void;
  onDeactivate?: (date: Date) => Promise<void> | void;
  onDataUpdate?: (data: any) => Promise<void> | void;

  // Remote plugin support (for module federation)
  remoteConfig?: {
    remoteUrl: string;
    scope: string;
    module: string;
  };
}

export interface DailyPluginState {
  [date: string]: {
    activePlugins: string[]; // Array of plugin IDs active on this date
    pluginData: { [pluginId: string]: any }; // Plugin-specific data for this date
    stackOrder: {
      left: string[];
      center: string[];
      right: string[];
    };
  };
}

export interface PluginStore {
  // Plugin registry
  availablePlugins: IPlugin[];
  dailyState: DailyPluginState;

  // Plugin management
  registerPlugin: (plugin: IPlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => IPlugin | undefined;
  getAllPlugins: () => IPlugin[];

  // Daily plugin management
  activatePlugin: (
    pluginId: string,
    date: string,
    stackId?: 'left' | 'center' | 'right',
  ) => void;
  deactivatePlugin: (pluginId: string, date: string) => void;
  movePlugin: (
    pluginId: string,
    date: string,
    fromStack: string,
    toStack: string,
    newOrder: number,
  ) => void;
  updatePluginData: (pluginId: string, date: string, data: any) => void;

  // Getters
  getActivePluginsForDate: (date: string) => IPlugin[];
  getPluginDataForDate: (pluginId: string, date: string) => any;
  getStackOrderForDate: (date: string) => {
    left: string[];
    center: string[];
    right: string[];
  };
}
