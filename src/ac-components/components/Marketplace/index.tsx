'use client';

import { Badge } from '@/ac-components/components/ui/badge';
import { Button } from '@/ac-components/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ac-components/components/ui/card';
import { pluginManager } from '@/ac-components/lib/plugins';
import type { HabitPlugin } from '@/ac-components/lib/plugins/types';
import { useNavigate } from '@modern-js/runtime/router';
import { Download, Package } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Marketplace() {
  const [featuredPlugins, setFeaturedPlugins] = useState<HabitPlugin[]>([]);
  const router = useNavigate();

  useEffect(() => {
    const loadPlugins = async () => {
      await pluginManager.ensureReady();
      const allPlugins = pluginManager.getAllPlugins();
      // For featured plugins, we'll just take the first 3 (or fewer if there aren't that many)
      setFeaturedPlugins(allPlugins.slice(0, 3));
    };

    loadPlugins();
  }, []);

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Plugin Marketplace</h2>
        <Button variant="outline" onClick={() => router('/marketplace')}>
          View All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featuredPlugins.length > 0 ? (
          featuredPlugins.map(plugin => (
            <Card key={plugin.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{plugin.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {plugin.description || 'No description available.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Badge variant="outline">v{plugin.version}</Badge>
                  {plugin.settings && (
                    <Badge variant="secondary">Configurable</Badge>
                  )}
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={() => router('/marketplace')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Install
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Discover Plugins</CardTitle>
              <CardDescription>
                Enhance your habit tracking experience with plugins.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="default"
                className="w-full"
                onClick={() => router('/marketplace')}
              >
                <Package className="h-4 w-4 mr-2" />
                Browse Marketplace
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
