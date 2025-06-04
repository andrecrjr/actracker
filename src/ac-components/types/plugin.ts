export type PluginPosition = {
  stackId: 'left' | 'center' | 'right';
  order: number;
};

// Plugin storage isolation interface
export interface PluginStorageAPI {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
}

// Plugin sandbox context for isolated execution
export interface PluginSandbox {
  storage: PluginStorageAPI;
  pluginId: string;
  metadata: {
    name: string;
    version: string;
    permissions: PluginPermissions;
  };
  // Restricted API surface for plugins
  hostAPI: {
    updatePluginData: (data: any) => void;
    getPluginData: () => any;
    emitEvent: (event: string, data?: any) => void;
    subscribeToEvent: (
      event: string,
      callback: (data?: any) => void,
    ) => () => void;
  };
}

// Plugin permissions system
export interface PluginPermissions {
  storage: {
    maxSize: number; // in bytes
    allowedKeys?: string[]; // if specified, restrict to these keys only
  };
  network: {
    allowedDomains?: string[]; // if specified, restrict to these domains
    maxRequests?: number; // per minute
  };
  events: {
    canEmit: string[]; // events this plugin can emit
    canSubscribe: string[]; // events this plugin can subscribe to
  };
  ui: {
    maxHeight?: number; // maximum height in pixels
    allowedComponents?: string[]; // allowed UI components
  };
}

export interface IPlugin {
  id: string;
  name: string;
  description?: string;
  version: string;
  icon?: string;
  color?: string;

  // Security and permissions
  permissions?: PluginPermissions;
  trusted?: boolean; // whether this plugin is trusted (affects sandbox restrictions)

  // Date-based state
  isActive: boolean;
  data?: Record<string, any>; // Plugin-specific data
  settings?: Record<string, any>; // Plugin configuration

  // Position for drag & drop
  position?: PluginPosition;

  // UI rendering - now receives sandbox context
  renderContent?: (
    date: Date,
    data?: any,
    sandbox?: PluginSandbox,
  ) => React.ReactNode;
  renderSettings?: (sandbox?: PluginSandbox) => React.ReactNode;

  // Lifecycle hooks - now receive sandbox context
  onDateChange?: (date: Date, sandbox?: PluginSandbox) => Promise<void> | void;
  onActivate?: (date: Date, sandbox?: PluginSandbox) => Promise<void> | void;
  onDeactivate?: (date: Date, sandbox?: PluginSandbox) => Promise<void> | void;
  onDataUpdate?: (data: any, sandbox?: PluginSandbox) => Promise<void> | void;

  // Remote plugin support (for module federation)
  remoteConfig?: {
    remoteUrl: string;
    scope: string;
    module: string;
    hash?: string; // integrity hash for security
    csp?: string; // content security policy
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
