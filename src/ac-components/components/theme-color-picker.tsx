import { type ThemeColor, useTheme } from '@/ac-components/hooks/use-theme';
import { cn } from '@/ac-components/lib/utils';
import { Check, Palette } from 'lucide-react';
import React from 'react';

interface ColorOption {
  value: ThemeColor;
  label: string;
  lightColor: string;
  darkColor: string;
  description: string;
}

const colorOptions: ColorOption[] = [
  {
    value: 'black',
    label: 'Classic',
    lightColor: 'bg-gray-900',
    darkColor: 'bg-gray-100',
    description: 'Timeless black & white',
  },
  {
    value: 'neutral-gray',
    label: 'Minimal',
    lightColor: 'bg-neutral-gray-900',
    darkColor: 'bg-neutral-gray-100',
    description: 'Clean minimalist gray',
  },
  {
    value: 'emerald',
    label: 'Emerald',
    lightColor: 'bg-emerald-600',
    darkColor: 'bg-emerald-500',
    description: 'Fresh emerald green',
  },
  {
    value: 'violet',
    label: 'Violet',
    lightColor: 'bg-violet-600',
    darkColor: 'bg-violet-500',
    description: 'Royal violet purple',
  },
  {
    value: 'rose',
    label: 'Rose',
    lightColor: 'bg-rose-500',
    darkColor: 'bg-rose-400',
    description: 'Elegant rose pink',
  },
  {
    value: 'amber',
    label: 'Amber',
    lightColor: 'bg-amber-500',
    darkColor: 'bg-amber-400',
    description: 'Warm amber gold',
  },
  {
    value: 'cyan',
    label: 'Cyan',
    lightColor: 'bg-cyan-500',
    darkColor: 'bg-cyan-400',
    description: 'Cool cyan blue',
  },
  {
    value: 'indigo',
    label: 'Indigo',
    lightColor: 'bg-indigo-600',
    darkColor: 'bg-indigo-500',
    description: 'Deep indigo blue',
  },
  {
    value: 'slate',
    label: 'Slate',
    lightColor: 'bg-slate-600',
    darkColor: 'bg-slate-400',
    description: 'Modern slate gray',
  },
];

interface ThemeColorPickerProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeColorPicker({
  className,
  showLabel = true,
}: ThemeColorPickerProps) {
  const { color: currentColor, setColor, isDark } = useTheme();

  return (
    <div className={cn('space-y-3', className)}>
      {showLabel && (
        <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
          <Palette size={16} />
          <span>Theme Color</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {colorOptions.map(option => {
          const isSelected = currentColor === option.value;
          const colorClass = isDark ? option.darkColor : option.lightColor;

          return (
            <button
              key={option.value}
              onClick={() => setColor(option.value)}
              className={cn(
                'group relative p-3 rounded-lg border-2 transition-all duration-200',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-card',
              )}
              title={option.description}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="relative">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full border-2 border-background shadow-sm',
                      colorClass,
                    )}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={16} className="text-white drop-shadow-sm" />
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium transition-colors',
                    isSelected
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground',
                  )}
                >
                  {option.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeColorPicker;
