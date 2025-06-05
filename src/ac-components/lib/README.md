# Plugin System Architecture

This directory contains the refactored plugin system components, broken down into focused, maintainable modules.

## File Structure

### Core Files

- **`plugin-storage.ts`** - Isolated storage implementation for plugins
  - Handles plugin-specific localStorage with quota management
  - Enforces permission-based key access
  - Provides async storage API

- **`plugin-events.ts`** - Inter-plugin communication system
  - Event emission and subscription with permission checks
  - Plugin lifecycle management for event cleanup
  - Singleton event system instance

- **`plugin-sandbox.ts`** - Plugin sandbox creation and management
  - Creates isolated execution environments for plugins
  - Provides controlled host API access
  - Manages default permissions and sandbox lifecycle

- **`plugin-utils.ts`** - Utility functions for plugin operations
  - Date normalization helpers
  - Stack management utilities
  - Day state initialization

### Main Store

- **`../hooks/usePluginStore.tsx`** - Simplified main plugin store
  - Uses extracted modules for cleaner separation of concerns
  - Focuses on state management and plugin lifecycle
  - Reduced from 571 lines to ~240 lines

## Key Improvements

1. **Separation of Concerns**: Each file has a single responsibility
2. **Reduced Complexity**: Main store is now much simpler and focused
3. **Better Testability**: Individual modules can be tested in isolation
4. **Improved Maintainability**: Changes to storage, events, or sandbox logic are isolated
5. **Cleaner Imports**: Related functionality is grouped together

## Usage

```typescript
import { usePluginStore } from '@/ac-components/hooks/usePluginStore';
import { pluginEventSystem } from '@/ac-components/lib/plugin-events';
import { createPluginSandbox } from '@/ac-components/lib/plugin-sandbox';

// The store now uses the extracted modules internally
const store = usePluginStore();

// Direct access to event system if needed
pluginEventSystem.emit('my-plugin', 'custom-event', data);

// Create sandbox for testing
const sandbox = createPluginSandbox(plugin, updateFn, getFn);
```

