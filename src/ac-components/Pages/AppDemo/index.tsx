import { ThemeSettings } from '@/ac-components/components/theme-settings';
import { useTheme } from '@/ac-components/hooks/use-theme';
import { cn } from '@/ac-components/lib/utils';
import {
  Bell,
  Calendar,
  CheckSquare,
  Cloud,
  Home,
  Plus,
  Search,
  Settings,
  User,
} from 'lucide-react';
import React from 'react';

const AppDemo = () => {
  const { color, isDark } = useTheme();

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: CheckSquare, label: 'Tasks' },
    { icon: Calendar, label: 'Calendar' },
    { icon: Cloud, label: 'Sync' },
    { icon: User, label: 'Profile' },
    { icon: Settings, label: 'Settings' },
  ];

  const plugins = [
    { name: 'Todo List', color: 'bg-primary/20 border-primary/30', items: 5 },
    {
      name: 'Weather',
      color: 'bg-blue-500/20 border-blue-500/30',
      temp: '22°C',
    },
    {
      name: 'Calendar',
      color: 'bg-green-500/20 border-green-500/30',
      events: 3,
    },
    {
      name: 'Notes',
      color: 'bg-yellow-500/20 border-yellow-500/30',
      notes: 12,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-all duration-300">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                R
              </span>
            </div>
            <h1 className="text-xl font-bold">Routini App</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User size={16} />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-[calc(100vh-73px)]">
          <div className="p-6">
            <nav className="space-y-2">
              {sidebarItems.map(({ icon: Icon, label, active }) => (
                <button
                  key={label}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Dashboard */}
            <div className="lg:col-span-3 space-y-6">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-2">Good morning! 👋</h2>
                <p className="text-muted-foreground">
                  You have 5 tasks pending and 3 meetings today. Current theme:{' '}
                  <span className="font-medium text-primary capitalize">
                    {color}
                  </span>
                </p>
              </div>

              {/* Plugins Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {plugins.map((plugin, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105',
                      plugin.color,
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{plugin.name}</h3>
                      <button className="p-1 hover:bg-background/20 rounded">
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {plugin.items && `${plugin.items} items`}
                      {plugin.temp && plugin.temp}
                      {plugin.events && `${plugin.events} events`}
                      {plugin.notes && `${plugin.notes} notes`}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    'Completed "Review project proposal"',
                    'Added new note "Meeting insights"',
                    'Updated weather location',
                    'Synced calendar events',
                  ].map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 text-sm"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-muted-foreground">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Settings Panel */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <ThemeSettings />

                {/* Theme Preview */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Preview
                  </h4>
                  <div className="space-y-2">
                    <div className="h-8 bg-primary rounded flex items-center px-3">
                      <span className="text-primary-foreground text-sm font-medium">
                        Primary Button
                      </span>
                    </div>
                    <div className="h-8 bg-muted rounded flex items-center px-3">
                      <span className="text-muted-foreground text-sm">
                        Secondary Element
                      </span>
                    </div>
                    <div className="h-8 bg-card border border-border rounded flex items-center px-3">
                      <span className="text-foreground text-sm">
                        Card Background
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color Info */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Current Theme</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>
                      Mode:{' '}
                      <span className="font-medium">
                        {isDark ? 'Dark' : 'Light'}
                      </span>
                    </div>
                    <div>
                      Color:{' '}
                      <span className="font-medium capitalize">{color}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppDemo;
