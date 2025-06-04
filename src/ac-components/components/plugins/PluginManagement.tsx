'use client';
// Temporarily disabled - needs update for new plugin system
// import { pluginManager } from '@/ac-components/lib/plugins';
import { PlugIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface PluginManagementProps {
  activeTabStatus?: 'available' | 'enabled';
}

export function PluginManagement({
  activeTabStatus = 'available',
}: PluginManagementProps) {
  const [activeTab, setActiveTab] = useState<string>(activeTabStatus);

  // TODO: Update this component to work with the new IPlugin system
  // This component was using the legacy habit plugin system

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:mt-4">
          <PlugIcon className="mr-2 h-4 w-4" />
          Manage Plugins
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80%]">
        <DialogHeader>
          <DialogTitle>Plugin Management</DialogTitle>
        </DialogHeader>
        <div className="p-4 text-center text-muted-foreground">
          <p>Plugin Management is being updated for the new plugin system.</p>
          <p>Use the + buttons in the daily view to add plugins for now.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
