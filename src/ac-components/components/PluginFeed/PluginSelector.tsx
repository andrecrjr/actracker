import type { IPlugin } from '@/ac-components/types/plugin';
import { loadSecureRemotePlugin } from '@/ac-components/utils/secure-plugin-loader';
import { AlertCircle, Download } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface PluginSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStack: 'left' | 'center' | 'right';
  availablePlugins: IPlugin[];
  onSelectPlugin: (plugin: IPlugin) => void;
  onRegisterPlugin: (plugin: IPlugin) => void;
  currentDateStr: string;
}

export function PluginSelector({
  isOpen,
  onClose,
  selectedStack,
  availablePlugins,
  onSelectPlugin,
  onRegisterPlugin,
  currentDateStr,
}: PluginSelectorProps) {
  const [isLoadingRemotePlugin, setIsLoadingRemotePlugin] = useState(false);
  const [remotePluginError, setRemotePluginError] = useState<string | null>(
    null,
  );

  const handleLoadRemoteTodoPlugin = async () => {
    setIsLoadingRemotePlugin(true);
    setRemotePluginError(null);

    try {
      const plugin = await loadSecureRemotePlugin({
        remoteUrl: 'http://localhost:3051/static/remoteEntry.js',
        scope: 'corePlugin',
        module: './TodoPlugin',
        permissions: {
          storage: { maxSize: 1024 * 1024 }, // 1MB
          network: { allowedDomains: [] }, // No network access
          events: {
            canEmit: ['todo:completed', 'todo:added'],
            canSubscribe: ['app:date:changed'],
          },
          ui: {
            maxHeight: 400,
            allowedComponents: ['div', 'span', 'button', 'input', 'checkbox'],
          },
        },
        timeout: 15000, // 15 seconds
      });

      onRegisterPlugin(plugin);
      onSelectPlugin(plugin);
      onClose();
    } catch (error) {
      console.error('Failed to load remote todoPlugin:', error);
      setRemotePluginError(
        error instanceof Error ? error.message : 'Failed to load remote plugin',
      );
    } finally {
      setIsLoadingRemotePlugin(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add Plugin to{' '}
            {selectedStack.charAt(0).toUpperCase() + selectedStack.slice(1)}{' '}
            Stack
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Remote Plugin Loading Section */}
          <div className="border rounded-lg p-4 bg-muted/20">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Load Remote Plugin
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Load the secure todoPlugin from localhost:3051
            </p>

            {remotePluginError && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{remotePluginError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleLoadRemoteTodoPlugin}
              disabled={isLoadingRemotePlugin}
              className="w-full"
            >
              {isLoadingRemotePlugin ? (
                <>Loading todoPlugin...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Load Remote todoPlugin
                </>
              )}
            </Button>
          </div>

          {/* Local Available Plugins */}
          <div>
            <h4 className="font-medium mb-2">Available Local Plugins</h4>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {availablePlugins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No available local plugins to add
                </div>
              ) : (
                availablePlugins.map(plugin => (
                  <div
                    key={plugin.id}
                    className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted"
                    onClick={() => onSelectPlugin(plugin)}
                  >
                    <div className="flex items-center gap-2">
                      {plugin.icon && (
                        <div className="text-lg">{plugin.icon}</div>
                      )}
                      <div>
                        <div className="font-medium">{plugin.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {plugin.description}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">v{plugin.version}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
