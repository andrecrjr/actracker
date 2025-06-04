import type { IPlugin, PluginSandbox } from '@/ac-components/types/plugin';
import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

// Example of a secure plugin using the new privacy system
const SecureExamplePlugin: IPlugin = {
  id: 'secure-example-plugin',
  name: 'Secure Example Plugin',
  description: 'Demonstrates the new privacy and security features',
  version: '2.0.0',
  icon: '🔒',
  color: '#059669',
  isActive: false,
  trusted: false, // This plugin demonstrates untrusted plugin capabilities

  // Define strict permissions for this plugin
  permissions: {
    storage: {
      maxSize: 100 * 1024, // 100KB limit
      allowedKeys: ['user-notes', 'settings', 'cache'], // Only these keys allowed
    },
    network: {
      allowedDomains: [], // No network access for this example
      maxRequests: 0,
    },
    events: {
      canEmit: ['secure-example:note-saved', 'secure-example:settings-changed'],
      canSubscribe: ['app:date:changed', 'app:theme:changed'],
    },
    ui: {
      maxHeight: 350,
      allowedComponents: ['div', 'span', 'button', 'input', 'textarea'],
    },
  },

  renderContent: (date: Date, data: any, sandbox?: PluginSandbox) => {
    return <SecurePluginContent date={date} data={data} sandbox={sandbox} />;
  },

  renderSettings: (sandbox?: PluginSandbox) => {
    return <SecurePluginSettings sandbox={sandbox} />;
  },

  onActivate: async (date: Date, sandbox?: PluginSandbox) => {
    console.log(`Secure plugin activated for ${date.toDateString()}`);

    // Initialize plugin with isolated storage
    try {
      await sandbox?.storage.set('initialized', {
        date: date.toISOString(),
        version: '2.0.0',
      });

      // Subscribe to app events
      const unsubscribe = sandbox?.hostAPI.subscribeToEvent(
        'app:date:changed',
        newDate => {
          console.log('Secure plugin: Date changed to', newDate);
        },
      );

      // Store subscription for cleanup
      await sandbox?.storage.set('subscriptions', [unsubscribe]);
    } catch (error) {
      console.error('Secure plugin activation error:', error);
    }
  },

  onDeactivate: async (date: Date, sandbox?: PluginSandbox) => {
    console.log(`Secure plugin deactivated for ${date.toDateString()}`);

    // Clean up subscriptions
    try {
      const subscriptions = (await sandbox?.storage.get('subscriptions')) || [];
      subscriptions.forEach((unsubscribe: () => void) => unsubscribe());
      await sandbox?.storage.remove('subscriptions');
    } catch (error) {
      console.error('Secure plugin deactivation error:', error);
    }
  },

  onDataUpdate: async (data: any, sandbox?: PluginSandbox) => {
    // Handle data updates securely
    try {
      await sandbox?.storage.set('last-update', {
        timestamp: new Date().toISOString(),
        data: data,
      });

      // Emit event about data update
      sandbox?.hostAPI.emitEvent('secure-example:note-saved', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Secure plugin data update error:', error);
    }
  },
};

// Plugin content component using sandbox features
function SecurePluginContent({
  date,
  data,
  sandbox,
}: {
  date: Date;
  data: any;
  sandbox?: PluginSandbox;
}) {
  const [notes, setNotes] = useState<string>('');
  const [currentNote, setCurrentNote] = useState<string>('');
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);

  // Load notes from isolated storage
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await sandbox?.storage.get('user-notes');
        if (savedNotes) {
          setNotes(savedNotes);
        }

        // Get storage info
        const keys = await sandbox?.storage.keys();
        setStorageInfo({
          keys: keys || [],
          permissions: sandbox?.metadata.permissions,
        });
      } catch (error) {
        console.error('Error loading notes:', error);
        if (error instanceof Error) {
          setEventLog(prev => [
            ...prev,
            `Error loading notes: ${error.message}`,
          ]);
        } else {
          setEventLog(prev => [...prev, 'Error loading notes: Unknown error']);
        }
      }
    };

    loadNotes();
  }, [sandbox]);

  // Subscribe to events
  useEffect(() => {
    if (!sandbox) return;

    const unsubscribeTheme = sandbox.hostAPI.subscribeToEvent(
      'app:theme:changed',
      theme => {
        setEventLog(prev => [...prev, `Theme changed to: ${theme}`]);
      },
    );

    return () => {
      unsubscribeTheme();
    };
  }, [sandbox]);

  const saveNote = async () => {
    try {
      const newNotes =
        notes + (notes ? '\n' : '') + `${date.toDateString()}: ${currentNote}`;

      // Save to isolated storage
      await sandbox?.storage.set('user-notes', newNotes);
      setNotes(newNotes);
      setCurrentNote('');

      // Update plugin data through host API
      sandbox?.hostAPI.updatePluginData({
        lastNote: currentNote,
        noteCount: newNotes.split('\n').length,
      });

      setEventLog(prev => [...prev, 'Note saved successfully']);
    } catch (error) {
      console.error('Error saving note:', error);
      if (error instanceof Error) {
        setEventLog(prev => [...prev, `Error saving note: ${error.message}`]);
      } else {
        setEventLog(prev => [...prev, 'Error saving note: Unknown error']);
      }
    }
  };

  const clearAllData = async () => {
    try {
      await sandbox?.storage.clear();
      setNotes('');
      setEventLog(prev => [...prev, 'All data cleared']);
    } catch (error) {
      console.error('Error clearing data:', error);
      if (error instanceof Error) {
        setEventLog(prev => [...prev, `Error clearing data: ${error.message}`]);
      } else {
        setEventLog(prev => [...prev, 'Error clearing data: Unknown error']);
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-700">
            🔒 Secure Note Taking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="note-input" className="text-xs">
              Add a note for {date.toDateString()}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="note-input"
                value={currentNote}
                onChange={e => setCurrentNote(e.target.value)}
                placeholder="Enter your note..."
                className="text-sm"
                maxLength={100} // UI restriction
              />
              <Button
                onClick={saveNote}
                size="sm"
                disabled={!currentNote.trim()}
              >
                Save
              </Button>
            </div>
          </div>

          {notes && (
            <div className="bg-muted/50 p-2 rounded text-xs">
              <div className="font-medium mb-1">Your Notes:</div>
              <pre className="whitespace-pre-wrap text-xs">{notes}</pre>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearAllData}>
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Information Display */}
      <Card className="border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-blue-700">
            Privacy & Security Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div>
            <strong>Storage Keys:</strong>{' '}
            {storageInfo?.keys.join(', ') || 'None'}
          </div>
          <div>
            <strong>Max Storage:</strong>{' '}
            {storageInfo?.permissions?.storage?.maxSize || 'Unknown'} bytes
          </div>
          <div>
            <strong>Allowed Domains:</strong>{' '}
            {storageInfo?.permissions?.network?.allowedDomains?.join(', ') ||
              'None'}
          </div>
          <div>
            <strong>Plugin ID:</strong> {sandbox?.pluginId}
          </div>
        </CardContent>
      </Card>

      {/* Event Log */}
      {eventLog.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Event Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
              {eventLog.slice(-5).map((log, i) => (
                <div key={i} className="text-muted-foreground">
                  {new Date().toLocaleTimeString()}: {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Plugin settings component
function SecurePluginSettings({ sandbox }: { sandbox?: PluginSandbox }) {
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = (await sandbox?.storage.get('settings')) || {
          autoSave: true,
          maxNotes: 10,
          theme: 'light',
        };
        setSettings(savedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [sandbox]);

  const updateSetting = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await sandbox?.storage.set('settings', newSettings);

      // Emit settings change event
      sandbox?.hostAPI.emitEvent('secure-example:settings-changed', {
        setting: key,
        value: value,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-xs text-muted-foreground">Loading settings...</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        These settings are stored in isolated plugin storage.
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.autoSave || false}
            onChange={e => updateSetting('autoSave', e.target.checked)}
          />
          Auto-save notes
        </label>

        <div className="space-y-1">
          <Label className="text-xs">
            Max notes: {settings.maxNotes || 10}
          </Label>
          <input
            type="range"
            min="5"
            max="20"
            value={settings.maxNotes || 10}
            onChange={e => updateSetting('maxNotes', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Theme</Label>
          <select
            value={settings.theme || 'light'}
            onChange={e => updateSetting('theme', e.target.value)}
            className="w-full text-xs border rounded px-2 py-1"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
        <strong>Security Note:</strong> This plugin cannot access data from
        other plugins or your browser's main localStorage.
      </div>
    </div>
  );
}

export default SecureExamplePlugin;
