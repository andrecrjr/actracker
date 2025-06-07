/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Minimalist color palette
        'neutral-gray': {
          DEFAULT: 'hsl(var(--neutral-gray))',
          50: 'hsl(240 5.9% 98%)',
          100: 'hsl(240 4.8% 95.9%)',
          200: 'hsl(240 5.9% 90%)',
          300: 'hsl(240 4.9% 83.9%)',
          400: 'hsl(240 5% 64.9%)',
          500: 'hsl(240 3.8% 46.1%)',
          600: 'hsl(240 5.2% 33.9%)',
          700: 'hsl(240 5.3% 26.1%)',
          800: 'hsl(240 3.7% 15.9%)',
          900: 'hsl(240 5.9% 10%)',
          950: 'hsl(240 10% 3.9%)',
        },
        'warm-gray': {
          DEFAULT: 'hsl(var(--warm-gray))',
          50: 'hsl(240 5.9% 98%)',
          100: 'hsl(240 4.8% 95.9%)',
          200: 'hsl(240 5.9% 90%)',
          300: 'hsl(240 4.9% 83.9%)',
          400: 'hsl(240 5% 64.9%)',
          500: 'hsl(var(--warm-gray))',
          600: 'hsl(240 5.2% 33.9%)',
          700: 'hsl(240 5.3% 26.1%)',
          800: 'hsl(240 3.7% 15.9%)',
          900: 'hsl(240 5.9% 10%)',
        },
        'soft-gray': {
          DEFAULT: 'hsl(var(--soft-gray))',
          50: 'hsl(240 5.9% 98%)',
          100: 'hsl(var(--soft-gray))',
          200: 'hsl(240 5.9% 90%)',
          300: 'hsl(240 4.9% 83.9%)',
          400: 'hsl(240 5% 64.9%)',
          500: 'hsl(240 3.8% 46.1%)',
          600: 'hsl(240 5.2% 33.9%)',
          700: 'hsl(240 5.3% 26.1%)',
          800: 'hsl(240 3.7% 15.9%)',
          900: 'hsl(240 5.9% 10%)',
        },
        'light-gray': 'hsl(var(--light-gray))',
        charcoal: 'hsl(var(--charcoal))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'subtle-pulse': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.9',
            transform: 'scale(1.02)',
          },
        },
        'gentle-float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-5px)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'subtle-pulse': 'subtle-pulse 3s ease-in-out infinite',
        'gentle-float': 'gentle-float 4s ease-in-out infinite',
      },
      backgroundImage: {
        'minimal-gradient':
          'linear-gradient(135deg, hsl(var(--neutral-gray)) 0%, hsl(var(--warm-gray)) 100%)',
        'minimal-gradient-dark':
          'linear-gradient(135deg, hsl(var(--charcoal)) 0%, hsl(240 10% 6%) 50%, hsl(240 5% 10%) 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
