'use client';

import { Badge } from '@/app/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Switch } from '@/app/components/ui/switch';
import type { HabitPlugin } from '@/app/lib/plugins/types';

interface PluginCardProps {
  plugin: HabitPlugin;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function PluginCard({ plugin, isEnabled, onToggle }: PluginCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-medium">{plugin.name}</CardTitle>
          <CardDescription>{plugin.description}</CardDescription>
        </div>
        <Switch checked={isEnabled} onCheckedChange={onToggle} />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Badge variant="outline">v{plugin.version}</Badge>
          {plugin.settings && <Badge variant="secondary">Configurable</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}
