'use client';

import { usePluginStore } from '@/ac-components/hooks/usePluginStore';
import type { IPlugin } from '@/ac-components/types/plugin';
import { GripVertical, Settings, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface PluginCardProps {
  plugin: IPlugin;
  currentDate: Date;
  pluginData?: any;
  onDeactivate?: (pluginId: string) => void;
  onDataUpdate?: (pluginId: string, data: any) => void;
  isDragging?: boolean;
  dragHandle?: React.ReactNode;
}

export function PluginCard({
  plugin,
  currentDate,
  pluginData,
  onDeactivate,
  onDataUpdate,
  isDragging = false,
  dragHandle,
}: PluginCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { getSandbox } = usePluginStore();

  const handleDeactivate = () => {
    if (onDeactivate) {
      onDeactivate(plugin.id);
    }
  };

  const renderPluginContent = () => {
    if (plugin.renderContent) {
      try {
        const sandbox = getSandbox(plugin.id);
        return plugin.renderContent(currentDate, pluginData, sandbox);
      } catch (error) {
        console.error(`Error rendering plugin ${plugin.id}:`, error);
        return (
          <div className="text-red-500">
            Error rendering plugin content
            {error instanceof Error && (
              <div className="text-xs mt-1">{error.message}</div>
            )}
          </div>
        );
      }
    }

    return (
      <div className="text-muted-foreground">
        <p>{plugin.description || 'No content available'}</p>
        {pluginData && (
          <pre className="text-xs mt-2 bg-muted p-2 rounded">
            {JSON.stringify(pluginData, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    if (plugin.renderSettings) {
      try {
        const sandbox = getSandbox(plugin.id);
        return plugin.renderSettings(sandbox);
      } catch (error) {
        console.error(
          `Error rendering settings for plugin ${plugin.id}:`,
          error,
        );
        return (
          <div className="text-red-500">
            Error rendering settings
            {error instanceof Error && (
              <div className="text-xs mt-1">{error.message}</div>
            )}
          </div>
        );
      }
    }

    return <div className="text-muted-foreground">No settings available</div>;
  };

  // Show privacy indicator for untrusted plugins
  const showPrivacyIndicator = plugin.trusted === false || plugin.remoteConfig;

  return (
    <Card
      className={`relative ${isDragging ? 'opacity-50' : ''} ${plugin.color ? `border-l-4` : ''}`}
      style={plugin.color ? { borderLeftColor: plugin.color } : {}}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2 flex-1">
          {dragHandle && (
            <div className="cursor-grab active:cursor-grabbing">
              {dragHandle}
            </div>
          )}

          {plugin.icon && (
            <div className="text-lg" title={plugin.name}>
              {plugin.icon}
            </div>
          )}

          <div>
            <CardTitle className="text-base font-medium">
              {plugin.name}
            </CardTitle>
            <div className="flex gap-1 mt-1">
              <Badge variant="outline" className="text-xs">
                v{plugin.version}
              </Badge>
              {plugin.isActive && (
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              )}
              {showPrivacyIndicator && (
                <Badge variant="secondary" className="text-xs">
                  🔒 Isolated
                </Badge>
              )}
              {plugin.remoteConfig && (
                <Badge variant="destructive" className="text-xs">
                  Remote
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {plugin.renderSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeactivate}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {showSettings ? (
          <div className="space-y-3">
            <div className="text-sm font-medium">Settings</div>
            {renderSettings()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(false)}
            >
              Back to Content
            </Button>
          </div>
        ) : (
          <div>
            {renderPluginContent()}
            {showPrivacyIndicator && (
              <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
                🔒 This plugin runs in an isolated environment with restricted
                access to your data.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
