'use client';

import { Badge } from '@/ac-components/components/ui/badge';
import { Button } from '@/ac-components/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ac-components/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ac-components/components/ui/form';
import { Input } from '@/ac-components/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ac-components/components/ui/tabs';
import { Textarea } from '@/ac-components/components/ui/textarea';
import { toast } from '@/ac-components/hooks/use-toast';
import { pluginManager } from '@/ac-components/lib/plugins';
import type {
  HabitPlugin,
  RemoteHabitPlugin,
} from '@/ac-components/lib/plugins/types';
import { Link, useNavigate } from '@modern-js/runtime/router';
import { ArrowLeft, Download, Plus, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface PluginFormValues {
  name: string;
  description: string;
  remoteUrl: string;
  scope: string;
  module: string;
  version: string;
}

export default function MarketplacePage() {
  const [plugins, setPlugins] = useState<HabitPlugin[]>([]);
  const [activeTab, setActiveTab] = useState<string>('browse');
  const router = useNavigate();

  const form = useForm<PluginFormValues>({
    defaultValues: {
      name: '',
      description: '',
      remoteUrl: '',
      scope: '',
      module: '',
      version: '1.0.0',
    },
  });

  useEffect(() => {
    const loadPlugins = async () => {
      await pluginManager.ensureReady();
      const allPlugins = pluginManager.getAllPlugins();
      setPlugins(allPlugins);
    };

    loadPlugins();
  }, []);

  const onSubmit = async (data: PluginFormValues) => {
    try {
      // In a real implementation, this would validate and register the plugin
      await pluginManager.registerRemotePlugin({
        remoteUrl: data.remoteUrl,
        scope: data.scope,
        module: data.module,
        description: data.description,
      } as RemoteHabitPlugin);

      toast({
        title: 'Plugin submitted',
        description: 'Your plugin has been submitted successfully.',
      });

      form.reset();

      // Refresh the plugin list
      const allPlugins = pluginManager.getAllPlugins();
      setPlugins(allPlugins);

      // Switch to browse tab
      setActiveTab('browse');
    } catch (error) {
      console.error('Failed to submit plugin:', error);
      toast({
        title: 'Submission failed',
        description:
          'There was an error submitting your plugin. Please check the console for details.',
        variant: 'destructive',
      });
    }
  };

  const handleInstallPlugin = async (plugin: HabitPlugin) => {
    // In a real implementation, this would install the plugin
    toast({
      title: 'Plugin installed',
      description: `${plugin.name} has been installed successfully.`,
    });
  };

  const handleUninstallPlugin = async (plugin: HabitPlugin) => {
    // In a real implementation, this would uninstall the plugin
    pluginManager.unregisterPlugin(plugin.id);

    toast({
      title: 'Plugin uninstalled',
      description: `${plugin.name} has been uninstalled successfully.`,
    });

    // Refresh the plugin list
    const allPlugins = pluginManager.getAllPlugins();
    setPlugins(allPlugins);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Plugins</TabsTrigger>
            <TabsTrigger value="submit">Submit Plugin</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plugins.length > 0 ? (
                plugins.map(plugin => (
                  <Card key={plugin.id}>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {plugin.name}
                        </CardTitle>
                        <CardDescription>{plugin.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-4">
                        <Badge variant="outline">v{plugin.version}</Badge>
                        {plugin.settings && (
                          <Badge variant="secondary">Configurable</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plugin.description || 'No description available.'}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUninstallPlugin(plugin)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Uninstall
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleInstallPlugin(plugin)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Install
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-10">
                  <p className="text-muted-foreground">
                    No plugins available. Submit a new plugin to get started.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="submit" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Submit a New Plugin</CardTitle>
                <CardDescription>
                  Fill out the form below to submit your plugin to the
                  marketplace.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plugin Name</FormLabel>
                          <FormControl>
                            <Input placeholder="My Awesome Plugin" {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of your plugin as it will appear in the
                            marketplace.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what your plugin does..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A brief description of your plugin's functionality.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="remoteUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remote URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/plugin/remoteEntry.js"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              The URL to your plugin's remote entry file.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="version"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Version</FormLabel>
                            <FormControl>
                              <Input placeholder="1.0.0" {...field} />
                            </FormControl>
                            <FormDescription>
                              The version of your plugin.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="scope"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scope</FormLabel>
                            <FormControl>
                              <Input placeholder="myPlugin" {...field} />
                            </FormControl>
                            <FormDescription>
                              The module federation scope of your plugin.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="module"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Module</FormLabel>
                            <FormControl>
                              <Input placeholder="./MyPlugin" {...field} />
                            </FormControl>
                            <FormDescription>
                              The module name to load from your plugin.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Plugin
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
