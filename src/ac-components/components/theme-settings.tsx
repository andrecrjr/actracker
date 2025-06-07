import { cn } from '@/ac-components/lib/utils';
import { Settings } from 'lucide-react';
import React from 'react';
import { ThemeColorPicker } from './theme-color-picker';
import { ThemeToggle } from './theme-toggle';

interface ThemeSettingsProps {
  className?: string;
  showTitle?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export function ThemeSettings({
  className,
  showTitle = true,
  layout = 'vertical',
}: ThemeSettingsProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {showTitle && (
        <div className="flex items-center space-x-2 text-lg font-semibold text-foreground">
          <Settings size={20} />
          <span>Theme Settings</span>
        </div>
      )}

      <div
        className={cn(
          'space-y-4',
          layout === 'horizontal' && 'flex items-start space-x-6 space-y-0',
        )}
      >
        {/* Mode Toggle Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Appearance
            </span>
            <ThemeToggle size="sm" />
          </div>
        </div>

        {/* Color Picker Section */}
        <div className="space-y-3">
          <ThemeColorPicker />
        </div>
      </div>
    </div>
  );
}

export default ThemeSettings;
