import { ThemeToggle } from '@/ac-components/components/theme-toggle';
import { LandingThemeProvider } from '@/ac-components/contexts/landing-theme-context';
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Code,
  Code2,
  PlugIcon,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';
import React from 'react';

const RoutiniLandingContent = () => {
  return (
    <div className="min-h-screen text-foreground transition-all duration-500">
      {/* Header */}
      <header className="container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Activity
            size={36}
            className="text-neutral-gray animate-subtle-pulse drop-shadow-lg"
          />
          <h1 className="text-3xl font-extrabold tracking-tight">Routini</h1>
        </div>
        <nav className="flex items-center space-x-6">
          <a
            href="#features"
            className="hover:text-neutral-gray transition-colors duration-300 font-medium"
          >
            Features
          </a>
          <a
            href="#waitlist"
            className="hover:text-neutral-gray transition-colors duration-300 font-medium"
          >
            Join Waitlist
          </a>
          <a
            href="/app"
            className="hover:text-neutral-gray transition-colors duration-300 font-medium"
          >
            App
          </a>
          <ThemeToggle size="md" />
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <section className="space-y-6">
          <h2 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-neutral-gray to-warm-gray bg-clip-text text-transparent">
              One Day, One Page:
            </span>
            <br />
            <span className="text-foreground">
              Your Productivity Revolution
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
            Routini simplifies your day with a modular, plugin-based system
            tailored to your unique needs. Focus on today, effortlessly.
          </p>
          <div className="space-y-4">
            {[
              {
                icon: CheckCircle2,
                text: 'Single Daily View with Vertical Plugins',
                color: 'text-neutral-gray',
              },
              {
                icon: PlugIcon,
                text: 'Install Only What You Need Today',
                color: 'text-warm-gray',
              },
              {
                icon: Code,
                text: 'Build Plugins with React & Module Federation',
                color: 'text-neutral-gray',
              },
            ].map(({ icon: Icon, text, color }, idx) => (
              <div key={idx} className="flex items-center space-x-3 group">
                <Icon
                  className={`${color} group-hover:scale-110 transition-transform duration-300`}
                  size={24}
                />
                <span className="text-lg group-hover:text-neutral-gray transition-colors duration-300">
                  {text}
                </span>
              </div>
            ))}
          </div>
          <a href="#waitlist">
            <button className="mt-8 bg-gradient-to-r from-neutral-gray to-warm-gray text-white px-8 py-3 rounded-full hover:shadow-lg hover:shadow-neutral-gray/25 transition-all duration-300 font-semibold group">
              Join the Waitlist
              <ChevronRight
                className="inline ml-2 group-hover:translate-x-1 transition-transform duration-300"
                size={20}
              />
            </button>
          </a>
        </section>

        <section className="relative">
          <div className="glass-effect dark:glass-effect-dark p-8 rounded-2xl relative overflow-hidden shadow-2xl border border-neutral-gray/20 dark:border-neutral-gray/30">
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-gray/10 via-warm-gray/5 to-neutral-gray/10 opacity-50 blur-3xl"></div>
            <div className="relative z-10 space-y-4">
              <div className="text-sm text-muted-foreground font-medium">
                Today's Stack
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    color: 'bg-neutral-gray/20 border border-neutral-gray/30',
                    label: 'Todo',
                    glow: 'shadow-neutral-gray/20',
                  },
                  {
                    color: 'bg-warm-gray/20 border border-warm-gray/30',
                    label: 'Weather',
                    glow: 'shadow-warm-gray/20',
                  },
                  {
                    color: 'bg-neutral-gray/15 border border-neutral-gray/25',
                    label: 'Journal',
                    glow: 'shadow-neutral-gray/15',
                  },
                  {
                    color: 'bg-warm-gray/15 border border-warm-gray/25',
                    label: 'Crypto',
                    glow: 'shadow-warm-gray/15',
                  },
                ].map(({ color, label, glow }, idx) => (
                  <div
                    key={idx}
                    className={`h-12 rounded-lg ${color} flex items-center justify-center text-sm font-medium hover:scale-105 transition-all duration-300 hover:shadow-lg ${glow} backdrop-blur-sm`}
                  >
                    {label}
                  </div>
                ))}
              </div>
              <button className="w-full bg-gradient-to-r from-neutral-gray/20 to-warm-gray/20 border border-neutral-gray/30 py-2 rounded-lg hover:from-neutral-gray/30 hover:to-warm-gray/30 transition-all duration-300 text-sm font-medium backdrop-blur-sm">
                + Add Plugin
              </button>
            </div>
            <div className="absolute top-4 right-4 flex space-x-2">
              <div className="w-3 h-3 bg-neutral-gray rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-warm-gray rounded-full animate-pulse delay-100"></div>
              <div className="w-3 h-3 bg-neutral-gray/70 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </section>
      </main>

      {/* Features Section */}
      <section
        id="features"
        className="container mx-auto px-6 py-16 text-center"
      >
        <h3 className="text-4xl font-bold mb-12 bg-gradient-to-r from-foreground to-neutral-gray bg-clip-text text-transparent">
          Why Routini Stands Out
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              text: 'Instant Plugin Setup',
              color: 'text-neutral-gray',
              desc: 'Add or remove plugins daily in seconds.',
              bgColor: 'from-neutral-gray/10 to-neutral-gray/5',
            },
            {
              icon: Cloud,
              text: 'Seamless Sync',
              color: 'text-neutral-gray',
              desc: 'Access your daily stack anywhere with PWA.',
              bgColor: 'from-neutral-gray/10 to-warm-gray/5',
            },
            {
              icon: Code2,
              text: 'Modular',
              color: 'text-neutral-gray',
              desc: 'Build your own plugins with React & Module Federation.',
              bgColor: 'from-neutral-gray/10 to-warm-gray/5',
            },
          ].map(({ icon: Icon, text, color, desc, bgColor }, idx) => (
            <div
              key={idx}
              className={`glass-effect dark:glass-effect-dark p-6 rounded-xl border border-neutral-gray/20 hover:border-neutral-gray/40 transition-all duration-300 hover:scale-105 bg-gradient-to-br ${bgColor} group`}
            >
              <Icon
                className={`mb-4 ${color} group-hover:scale-110 transition-transform duration-300 animate-gentle-float`}
                size={40}
              />
              <h4 className="text-xl font-semibold mb-2 group-hover:text-neutral-gray transition-colors duration-300">
                {text}
              </h4>
              <p className="text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Waitlist Section */}
      <section
        id="waitlist"
        className="container mx-auto px-6 py-16 text-center"
      >
        <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-neutral-gray bg-clip-text text-transparent">
          Join the Routini Waitlist
        </h3>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          Be the first to experience the Alpha release of Routini. Sign up now
          to secure your spot!
        </p>
        <div className="max-w-md mx-auto glass-effect dark:glass-effect-dark p-6 rounded-xl border border-neutral-gray/20">
          <iframe
            src="https://your-waitlist-service.com/embed"
            className="w-full h-96 border-0 rounded-lg"
            title="Routini Waitlist Form"
          ></iframe>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h3 className="text-4xl font-bold mb-12 bg-gradient-to-r from-foreground to-neutral-gray bg-clip-text text-transparent">
          Simple Pricing, Powerful Features
        </h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              title: 'Free Tier',
              icon: Smartphone,
              price: '$0',
              features: [
                'Core Plugins (Todo, Weather)',
                'Single-Device Access',
                'Basic Plugin Marketplace',
              ],
              color: 'border-neutral-gray/30',
              bgGradient: 'from-neutral-gray/5 to-warm-gray/5',
            },
            {
              title: 'Pro Tier',
              icon: Cloud,
              price: '$4/mo',
              features: [
                'Unlimited Plugins',
                'Cross-Platform Sync',
                'Advanced Analytics',
                'Priority Support',
              ],
              color: 'border-warm-gray/30',
              bgGradient: 'from-warm-gray/5 to-neutral-gray/5',
              popular: true,
            },
          ].map(
            (
              {
                title,
                icon: Icon,
                price,
                features,
                color,
                bgGradient,
                popular,
              },
              idx,
            ) => (
              <div
                key={idx}
                className={`glass-effect dark:glass-effect-dark p-8 rounded-2xl border ${color} hover:border-neutral-gray/50 transition-all duration-300 hover:scale-105 bg-gradient-to-br ${bgGradient} relative group`}
              >
                {popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-neutral-gray to-warm-gray text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-2xl font-semibold flex items-center group-hover:text-neutral-gray transition-colors duration-300">
                    <Icon
                      className="mr-3 group-hover:scale-110 transition-transform duration-300"
                      size={28}
                    />{' '}
                    {title}
                  </h4>
                  <span className="text-3xl font-bold bg-gradient-to-r from-neutral-gray to-warm-gray bg-clip-text text-transparent">
                    {price}
                  </span>
                </div>
                <ul className="space-y-3 text-left">
                  {features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center">
                      <CheckCircle2
                        size={18}
                        className="mr-2 text-neutral-gray"
                      />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-6 w-full bg-gradient-to-r from-neutral-gray to-warm-gray text-white py-3 rounded-full hover:shadow-lg hover:shadow-neutral-gray/25 transition-all duration-300 font-semibold">
                  Choose {title}
                </button>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 text-center text-muted-foreground border-t border-border/50">
        <p>© 2025 Routini. All rights reserved.</p>
      </footer>
    </div>
  );
};

const RoutiniLanding = () => {
  return (
    <LandingThemeProvider>
      <RoutiniLandingContent />
    </LandingThemeProvider>
  );
};

export default RoutiniLanding;
