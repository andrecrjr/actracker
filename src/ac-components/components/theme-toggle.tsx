import { useTheme } from '@/ac-components/hooks/use-theme';
import { cn } from '@/ac-components/lib/utils';
import { Moon, Sun } from 'lucide-react';
import React from 'react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative rounded-full border-2 transition-all duration-300 ease-in-out',
        'hover:scale-110 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-neutral-gray focus:ring-offset-2',
        'bg-background/80 backdrop-blur-sm',
        isDark
          ? 'border-neutral-gray/50 hover:border-neutral-gray text-neutral-gray hover:bg-neutral-gray/10'
          : 'border-warm-gray/30 hover:border-warm-gray text-warm-gray hover:bg-warm-gray/10',
        sizeClasses[size],
        className,
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Sun
          size={iconSizes[size]}
          className={cn(
            'absolute transition-all duration-300 ease-in-out',
            isDark
              ? 'opacity-0 rotate-90 scale-0'
              : 'opacity-100 rotate-0 scale-100',
          )}
        />
        <Moon
          size={iconSizes[size]}
          className={cn(
            'absolute transition-all duration-300 ease-in-out',
            isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0',
          )}
        />
      </div>

      {/* Glow effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-full transition-opacity duration-300',
          'bg-gradient-to-r opacity-0 blur-md -z-10',
          isDark
            ? 'from-neutral-gray/20 to-warm-gray/20 hover:opacity-100'
            : 'from-warm-gray/20 to-warm-gray/10 hover:opacity-100',
        )}
      />
    </button>
  );
}

export default ThemeToggle;
