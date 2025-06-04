import { DayNavigation } from '@/ac-components/components/DayNavigation';
import { Marketplace } from '@/ac-components/components/Marketplace';
import { DailyPluginView } from '@/ac-components/components/plugins/DailyPluginView';
import { Link, useNavigate } from '@modern-js/runtime/router';
import {
  Calendar,
  Cloud,
  Home as HomeIcon,
  Package,
  Plus,
  Settings,
} from 'lucide-react';
import { startTransition, useEffect, useState } from 'react';
import { useAuth, usePluginStore } from '../hooks';
import SignInCloudButton from './Buttons/SignIn';
import { samplePlugins } from './plugins/examples/samplePlugins';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarMode, setCalendarMode] = useState(false);
  const { isAuthenticated } = useAuth();
  const { registerPlugin, getAllPlugins } = usePluginStore();
  const router = useNavigate();

  // Initialize sample plugins
  useEffect(() => {
    const existingPlugins = getAllPlugins();
    if (existingPlugins.length === 0) {
      startTransition(() => {
        samplePlugins.forEach(plugin => {
          registerPlugin(plugin);
        });
      });
    }
  }, [registerPlugin, getAllPlugins]);

  useEffect(() => {
    setCalendarMode(JSON.parse(localStorage.getItem('calendarMode')! ?? false));
  }, []);

  const handleCalendarModeToggle = (mode: boolean) => {
    setCalendarMode(mode);
    localStorage.setItem('calendarMode', JSON.stringify(mode));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <div className="container mx-auto px-2 py-4 pb-16 max-w-6xl flex-1">
        <section className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 text-left">
            Daystack
          </h1>
          <SignInCloudButton />
        </section>

        {!calendarMode ? (
          <>
            <DayNavigation
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
            <DailyPluginView currentDate={currentDate} />
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-lg font-medium mb-2">Calendar View</h2>
            <p>Calendar view for plugins coming soon...</p>
          </div>
        )}

        <Marketplace />
      </div>

      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-lg flex justify-around py-2">
        <button
          className={`flex flex-col items-center ${!calendarMode ? 'text-primary' : 'text-gray-600'}`}
          onClick={() => handleCalendarModeToggle(false)}
        >
          <HomeIcon className="h-6 w-6" />
          <span className="text-xs">Daily</span>
        </button>

        <button
          className={`flex flex-col items-center ${calendarMode ? 'text-primary' : 'text-gray-600'}`}
          onClick={() => handleCalendarModeToggle(true)}
        >
          <Calendar className="h-6 w-6" />
          <span className="text-xs">Calendar</span>
        </button>

        <button
          className="flex flex-col items-center text-gray-600"
          onClick={() => router('/marketplace')}
        >
          <Package className="h-6 w-6" />
          <span className="text-xs">Plugins</span>
        </button>

        <button
          className="flex flex-col items-center text-gray-600"
          onClick={() => router('/habits')}
        >
          <Settings className="h-6 w-6" />
          <span className="text-xs">Settings</span>
        </button>

        <button
          className="flex flex-col items-center text-gray-600"
          onClick={() => {
            // Future: Open plugin management dialog
            console.log('Plugin management coming soon...');
          }}
        >
          <Plus className="h-6 w-6" />
          <span className="text-xs">Add</span>
        </button>
      </footer>
    </div>
  );
}
