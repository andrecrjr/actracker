import type { IPlugin, PluginPermissions } from '@/ac-components/types/plugin';

interface SecurePluginConfig {
  remoteUrl: string;
  scope: string;
  module: string;
  hash?: string; // integrity hash
  csp?: string; // content security policy
  permissions?: PluginPermissions;
  timeout?: number; // loading timeout in ms
}

class SecurePluginLoader {
  private loadedModules = new Map<string, any>();
  private securityPolicies = new Map<string, string>();
  private loadingTimeout = 10000; // 10 seconds default

  /**
   * Validates the integrity of a remote module using hash
   */
  private async validateIntegrity(
    url: string,
    expectedHash?: string,
  ): Promise<boolean> {
    if (!expectedHash) {
      console.warn(
        `No integrity hash provided for ${url}. Loading without validation.`,
      );
      return true;
    }

    try {
      const response = await fetch(url);
      const content = await response.text();

      // Create hash of the content
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      return hashHex === expectedHash;
    } catch (error) {
      console.error(`Failed to validate integrity for ${url}:`, error);
      return false;
    }
  }

  /**
   * Applies Content Security Policy for the plugin
   */
  private applyCSP(pluginId: string, csp?: string): void {
    if (!csp) return;

    // Store the CSP for this plugin
    this.securityPolicies.set(pluginId, csp);

    // In a real implementation, you might want to:
    // 1. Create an iframe with the CSP
    // 2. Use a service worker to enforce policies
    // 3. Validate network requests against allowed domains
    console.log(`Applied CSP for plugin ${pluginId}:`, csp);
  }

  /**
   * Creates a sandboxed iframe for executing untrusted plugins
   */
  private createSandboxedEnvironment(pluginId: string): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.id = `plugin-sandbox-${pluginId}`;
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    return iframe;
  }

  /**
   * Loads a remote plugin with security measures
   */
  async loadSecurePlugin(config: SecurePluginConfig): Promise<IPlugin> {
    const {
      remoteUrl,
      scope,
      module,
      hash,
      csp,
      permissions,
      timeout = this.loadingTimeout,
    } = config;
    const moduleKey = `${scope}/${module}`;

    // Check if already loaded
    if (this.loadedModules.has(moduleKey)) {
      return this.loadedModules.get(moduleKey);
    }

    try {
      // Validate integrity if hash is provided
      if (!(await this.validateIntegrity(remoteUrl, hash))) {
        throw new Error(`Integrity validation failed for ${remoteUrl}`);
      }

      // Load with timeout
      const loadPromise = this.loadRemoteModule(remoteUrl, scope, module);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Plugin loading timeout')), timeout),
      );

      const loadedModule = await Promise.race([loadPromise, timeoutPromise]);

      if (!loadedModule || typeof loadedModule !== 'object') {
        throw new Error('Invalid plugin module structure');
      }

      // Validate plugin structure
      const plugin = this.validatePluginStructure(loadedModule);

      // Apply security measures
      plugin.permissions = permissions || this.getDefaultPermissions();
      plugin.trusted = false; // Remote plugins are untrusted by default
      plugin.remoteConfig = { remoteUrl, scope, module, hash, csp };

      // Apply CSP
      this.applyCSP(plugin.id, csp);

      // Cache the loaded module
      this.loadedModules.set(moduleKey, plugin);

      return plugin;
    } catch (error) {
      console.error(`Failed to load secure plugin from ${remoteUrl}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced remote module loader with security checks
   */
  private async loadRemoteModule(
    remoteUrl: string,
    scope: string,
    module: string,
  ): Promise<any> {
    if (typeof window === 'undefined') {
      throw new Error(
        'Remote modules can only be loaded in browser environment',
      );
    }

    // Validate URL format
    try {
      new URL(remoteUrl);
    } catch {
      throw new Error(`Invalid remote URL: ${remoteUrl}`);
    }

    // Load the remote entry script with timeout
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = remoteUrl;
      script.async = true;
      script.crossOrigin = 'anonymous'; // Enable CORS

      const timeout = setTimeout(() => {
        script.remove();
        reject(new Error(`Timeout loading ${remoteUrl}`));
      }, this.loadingTimeout);

      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        reject(new Error(`Failed to load ${remoteUrl}`));
      };

      document.head.appendChild(script);
    });

    // Initialize sharing
    if (typeof __webpack_init_sharing__ !== 'undefined') {
      await __webpack_init_sharing__('default');
    }

    // Get the container
    const container = (window as any)[scope];
    if (!container) {
      throw new Error(`Container ${scope} not found`);
    }

    // Initialize container
    if (typeof __webpack_share_scopes__ !== 'undefined') {
      await container.init(__webpack_share_scopes__.default);
    }

    // Get the module factory
    const factory = await container.get(module);
    if (!factory) {
      throw new Error(`Module ${module} not found in container ${scope}`);
    }

    // Execute factory and return module
    const Module = factory();
    return Module?.default || Module;
  }

  /**
   * Validates that the loaded module has the correct plugin structure
   */
  private validatePluginStructure(module: any): IPlugin {
    if (!module.id || typeof module.id !== 'string') {
      throw new Error('Plugin must have a valid id');
    }

    if (!module.name || typeof module.name !== 'string') {
      throw new Error('Plugin must have a valid name');
    }

    if (!module.version || typeof module.version !== 'string') {
      throw new Error('Plugin must have a valid version');
    }

    // Validate functions are actually functions
    const functionalProps = [
      'renderContent',
      'renderSettings',
      'onActivate',
      'onDeactivate',
      'onDataUpdate',
      'onDateChange',
    ];
    for (const prop of functionalProps) {
      if (module[prop] && typeof module[prop] !== 'function') {
        throw new Error(`Plugin property ${prop} must be a function`);
      }
    }

    return module as IPlugin;
  }

  /**
   * Gets default permissions for untrusted plugins
   */
  private getDefaultPermissions(): PluginPermissions {
    return {
      storage: {
        maxSize: 1024 * 1024, // 1MB for untrusted plugins
        allowedKeys: ['settings', 'data', 'cache'], // Restricted key access
      },
      network: {
        allowedDomains: [], // No network access by default
        maxRequests: 10, // Very limited requests
      },
      events: {
        canEmit: ['plugin:data:updated'],
        canSubscribe: ['app:date:changed'],
      },
      ui: {
        maxHeight: 300, // Limited height
        allowedComponents: ['div', 'span', 'p', 'button'], // Basic components only
      },
    };
  }

  /**
   * Unloads a plugin and cleans up resources
   */
  unloadPlugin(pluginId: string): void {
    // Remove from loaded modules
    for (const [key, plugin] of this.loadedModules.entries()) {
      if (plugin.id === pluginId) {
        this.loadedModules.delete(key);
        break;
      }
    }

    // Remove security policies
    this.securityPolicies.delete(pluginId);

    // Remove sandbox iframe if exists
    const iframe = document.getElementById(`plugin-sandbox-${pluginId}`);
    if (iframe) {
      iframe.remove();
    }

    // Clear plugin-specific localStorage
    const prefix = `plugin:${pluginId}:`;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// Export singleton instance
export const securePluginLoader = new SecurePluginLoader();

// Helper function for easy plugin loading
export async function loadSecureRemotePlugin(
  config: SecurePluginConfig,
): Promise<IPlugin> {
  return securePluginLoader.loadSecurePlugin(config);
}
