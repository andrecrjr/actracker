# Plugin Privacy and Security Guide

This guide explains the enhanced privacy and security features implemented for the plugin system, particularly for module federation scenarios.

## Overview

The plugin system now implements several layers of privacy and security:

1. **Isolated Storage**: Each plugin gets its own storage namespace
2. **Permission System**: Granular control over plugin capabilities
3. **Sandbox Environment**: Plugins run in controlled contexts
4. **Secure Loading**: Enhanced security for remote plugins
5. **Event System**: Controlled inter-plugin communication

## Key Features

### 1. Plugin Storage Isolation

Each plugin now has its own isolated storage space:

```typescript
// In your plugin code
export default {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',

  renderContent: (date: Date, data: any, sandbox?: PluginSandbox) => {
    // Access isolated storage
    const storage = sandbox?.storage;

    // Save data (only accessible by this plugin)
    await storage?.set('user-settings', { theme: 'dark' });

    // Retrieve data
    const settings = await storage?.get('user-settings');

    return <div>Plugin content with settings: {JSON.stringify(settings)}</div>;
  }
};
```

**Storage API Methods:**
- `get(key: string)`: Retrieve value
- `set(key: string, value: any)`: Store value
- `remove(key: string)`: Delete value
- `clear()`: Clear all plugin data
- `keys()`: List all plugin keys

### 2. Permission System

Plugins can declare permissions to control their capabilities:

```typescript
export default {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',

  // Define plugin permissions
  permissions: {
    storage: {
      maxSize: 2 * 1024 * 1024, // 2MB limit
      allowedKeys: ['settings', 'cache', 'user-data'] // Restrict key access
    },
    network: {
      allowedDomains: ['api.myservice.com'], // Only allow specific domains
      maxRequests: 50 // Limit API calls per minute
    },
    events: {
      canEmit: ['plugin:data:updated', 'my-plugin:custom-event'],
      canSubscribe: ['app:date:changed', 'user:preferences:updated']
    },
    ui: {
      maxHeight: 400, // Limit plugin height
      allowedComponents: ['div', 'span', 'button', 'input'] // UI restrictions
    }
  },

  renderContent: (date, data, sandbox) => {
    // Plugin code here
  }
};
```

### 3. Sandbox Environment

Plugins receive a sandbox context that provides controlled access to host APIs:

```typescript
export default {
  id: 'my-plugin',

  renderContent: (date: Date, data: any, sandbox?: PluginSandbox) => {
    // Access sandbox APIs
    const { storage, hostAPI, metadata } = sandbox;

    // Update plugin data through host API
    hostAPI.updatePluginData({ lastViewed: date });

    // Get current plugin data
    const currentData = hostAPI.getPluginData();

    // Emit events (permission-controlled)
    hostAPI.emitEvent('plugin:data:updated', { date, data });

    // Subscribe to events (permission-controlled)
    const unsubscribe = hostAPI.subscribeToEvent('app:date:changed', (newDate) => {
      console.log('Date changed:', newDate);
    });

    // Check plugin metadata
    console.log('Plugin permissions:', metadata.permissions);

    return <div>Sandbox-enabled plugin content</div>;
  }
};
```

### 4. Secure Remote Plugin Loading

For module federation scenarios, use the secure plugin loader:

```typescript
import { loadSecureRemotePlugin } from '@/ac-components/utils/secure-plugin-loader';

// Load a remote plugin with security measures
const plugin = await loadSecureRemotePlugin({
  remoteUrl: 'https://plugins.example.com/remote-entry.js',
  scope: 'myPluginScope',
  module: './MySecurePlugin',

  // Optional: Integrity validation
  hash: 'sha256-abc123...', // SHA-256 hash of the remote entry

  // Optional: Content Security Policy
  csp: "default-src 'self'; script-src 'self' 'unsafe-inline'",

  // Optional: Custom permissions (defaults to restrictive)
  permissions: {
    storage: { maxSize: 1024 * 1024 }, // 1MB
    network: { allowedDomains: ['api.example.com'] },
    events: {
      canEmit: ['plugin:data:updated'],
      canSubscribe: ['app:date:changed']
    }
  },

  // Optional: Loading timeout
  timeout: 15000 // 15 seconds
});

// Register the securely loaded plugin
usePluginStore.getState().registerPlugin(plugin);
```

### 5. Inter-Plugin Communication

Plugins can communicate through a controlled event system:

```typescript
// Plugin A - Emitting events
export default {
  id: 'plugin-a',
  permissions: {
    events: {
      canEmit: ['data:export:ready'],
      canSubscribe: []
    }
  },

  renderContent: (date, data, sandbox) => {
    const handleExport = () => {
      // Emit event to other plugins
      sandbox.hostAPI.emitEvent('data:export:ready', {
        pluginId: 'plugin-a',
        data: { exportedAt: new Date() }
      });
    };

    return <button onClick={handleExport}>Export Data</button>;
  }
};

// Plugin B - Listening for events
export default {
  id: 'plugin-b',
  permissions: {
    events: {
      canEmit: [],
      canSubscribe: ['data:export:ready']
    }
  },

  renderContent: (date, data, sandbox) => {
    const [exportEvents, setExportEvents] = useState([]);

    useEffect(() => {
      // Subscribe to events from other plugins
      const unsubscribe = sandbox.hostAPI.subscribeToEvent('data:export:ready', (eventData) => {
        setExportEvents(prev => [...prev, eventData]);
      });

      return unsubscribe; // Cleanup on unmount
    }, []);

    return (
      <div>
        <h3>Export Events Received:</h3>
        {exportEvents.map((event, i) => (
          <div key={i}>Export from {event.pluginId} at {event.data.exportedAt}</div>
        ))}
      </div>
    );
  }
};
```

## Security Best Practices

### For Plugin Developers

1. **Always use the sandbox APIs** instead of direct browser APIs
2. **Declare minimal permissions** - only request what you need
3. **Validate all inputs** from the sandbox environment
4. **Handle errors gracefully** - sandbox operations may fail due to permissions
5. **Clean up resources** in plugin lifecycle hooks

```typescript
export default {
  id: 'secure-plugin',

  onActivate: async (date, sandbox) => {
    // Initialize plugin resources
    await sandbox?.storage.set('initialized', true);
  },

  onDeactivate: async (date, sandbox) => {
    // Clean up resources
    const subscriptions = await sandbox?.storage.get('subscriptions') || [];
    subscriptions.forEach(unsubscribe => unsubscribe());
  },

  renderContent: (date, data, sandbox) => {
    try {
      // Safe plugin code
      return <div>Secure plugin content</div>;
    } catch (error) {
      // Handle errors gracefully
      return <div>Plugin error: {error.message}</div>;
    }
  }
};
```

### For Host Applications

1. **Use the secure plugin loader** for remote plugins
2. **Validate plugin integrity** with hashes
3. **Set restrictive default permissions**
4. **Monitor plugin resource usage**
5. **Implement CSP policies** for additional security

```typescript
// Example of secure plugin registration
const registerSecurePlugin = async (pluginConfig) => {
  try {
    // Load with security measures
    const plugin = await loadSecureRemotePlugin({
      ...pluginConfig,
      permissions: {
        storage: { maxSize: 500 * 1024 }, // 500KB limit
        network: { allowedDomains: [] }, // No network access
        events: {
          canEmit: ['plugin:ready'],
          canSubscribe: ['app:date:changed']
        }
      }
    });

    // Additional validation
    if (!plugin.id || !plugin.name) {
      throw new Error('Invalid plugin structure');
    }

    // Register with the store
    usePluginStore.getState().registerPlugin(plugin);

  } catch (error) {
    console.error('Failed to register plugin:', error);
    // Handle error appropriately
  }
};
```

## Privacy Benefits

1. **Data Isolation**: Plugins cannot access each other's data
2. **Storage Quotas**: Prevents plugins from consuming excessive storage
3. **Network Control**: Restricts which domains plugins can access
4. **Event Filtering**: Controls inter-plugin communication
5. **UI Restrictions**: Limits plugin interface capabilities
6. **Audit Trail**: All plugin actions are logged and traceable

## Migration Guide

### Updating Existing Plugins

If you have existing plugins, update them to use the new sandbox system:

```typescript
// Old plugin code
export default {
  id: 'my-plugin',
  renderContent: (date, data) => {
    // Direct localStorage access (NOT RECOMMENDED)
    localStorage.setItem('my-plugin-data', JSON.stringify(data));

    return <div>Old plugin</div>;
  }
};

// Updated plugin code
export default {
  id: 'my-plugin',
  renderContent: (date, data, sandbox) => {
    // Use sandbox storage API
    sandbox?.storage.set('data', data);

    return <div>Updated secure plugin</div>;
  }
};
```

### Updating Plugin Registration

```typescript
// Old registration
usePluginStore.getState().registerPlugin(myPlugin);

// New secure registration for remote plugins
const plugin = await loadSecureRemotePlugin({
  remoteUrl: 'https://example.com/plugin.js',
  scope: 'myPlugin',
  module: './Plugin',
  permissions: { /* custom permissions */ }
});
usePluginStore.getState().registerPlugin(plugin);
```

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**: Check that your plugin has the required permissions
2. **Storage Quota Exceeded**: Reduce data size or request higher quota
3. **Network Blocked**: Ensure the domain is in `allowedDomains`
4. **Event Not Received**: Verify both emit and subscribe permissions

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// Enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  window.__PLUGIN_DEBUG__ = true;
}
```

This privacy system ensures that plugins in a module federation environment cannot access each other's data or the host application's sensitive information, while still providing a rich API for plugin functionality.
