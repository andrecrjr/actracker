import { Link } from '@modern-js/runtime/router';
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Code,
  Lock,
  PlugIcon,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';
import React from 'react';

const ACTrackerLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 text-white">
      <header className="container mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Activity size={32} className="text-white" />
          <h1 className="text-2xl font-bold">ACTracker</h1>
        </div>
        <nav>
          <a href={'/app'}>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-colors">
              Get Started
            </button>
          </a>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <section>
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">
            Transform Your Daily Habits
          </h2>
          <p className="text-xl text-white/80 mb-8">
            ACTracker: A powerful, extensible habit tracking platform that
            adapts to your unique lifestyle.
          </p>
          <div className="space-y-4">
            {[
              { icon: CheckCircle2, text: 'Daily Habit Tracking' },
              { icon: PlugIcon, text: 'Customizable Plugin System' },
              { icon: Code, text: 'Develop Your Own Plugins' },
            ].map(({ icon: Icon, text }, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <Icon className="text-green-400" />
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 flex space-x-4">
            <a href={'/app'}>
              <button className="bg-white text-indigo-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center">
                Start Now <ChevronRight className="ml-2" />
              </button>
            </a>
            <button className="border border-white/30 px-6 py-3 rounded-full hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </section>

        <section className="relative">
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-lg border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-pink-500/30 opacity-50 blur-2xl"></div>

            <div className="relative z-10 grid grid-cols-3 gap-4">
              {[
                { color: 'bg-green-500/50', label: 'Reading' },
                { color: 'bg-blue-500/50', label: 'Fitness' },
                { color: 'bg-purple-500/50', label: 'Meditation' },
                { color: 'bg-yellow-500/50', label: 'Learning' },
                { color: 'bg-red-500/50', label: 'Coding' },
                { color: 'bg-teal-500/50', label: 'Nutrition' },
              ].map(({ color, label }, idx) => (
                <div
                  key={idx}
                  className={`h-16 rounded-lg ${color} flex items-center justify-center`}
                >
                  <span className="text-xs text-white opacity-80">{label}</span>
                </div>
              ))}
            </div>

            <div className="absolute top-0 right-0 m-4 flex space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { icon: Zap, text: 'Quick Tracking', color: 'text-yellow-400' },
              {
                icon: ShieldCheck,
                text: 'Secure Data',
                color: 'text-green-400',
              },
              { icon: Cloud, text: 'Cloud Sync', color: 'text-blue-400' },
            ].map(({ icon: Icon, text, color }, idx) => (
              <div
                key={idx}
                className="bg-white/10 p-4 rounded-lg flex items-center justify-center flex-col text-center"
              >
                <Icon className={`mb-2 ${color}`} size={32} />
                <span className="text-xs">{text}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Remaining sections stay the same as previous artifact */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h3 className="text-4xl font-bold mb-12">Pricing & Features</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Free Mode',
              icon: Smartphone,
              price: '$0',
              features: [
                'Single Device Tracking',
                'Basic Habit Logs',
                'Limited Plugin Access',
              ],
              color: 'border-blue-500',
            },
            {
              title: 'Pro Mode',
              icon: Cloud,
              price: '$4.99/mo',
              features: [
                'Multi-Platform Sync',
                'Unlimited Plugins',
                'Cloud Backup',
                'Advanced Analytics',
              ],
              color: 'border-purple-500',
            },
          ].map(({ title, icon: Icon, price, features, color }, idx) => (
            <div
              key={idx}
              className={`bg-white/10 p-8 rounded-2xl border ${color} hover:bg-white/20 transition-colors`}
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-2xl font-semibold flex items-center">
                  <Icon className="mr-3" /> {title}
                </h4>
                <span className="text-3xl font-bold">{price}</span>
              </div>
              <ul className="space-y-3">
                {features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-center">
                    <CheckCircle2 size={18} className="mr-2 text-green-400" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full bg-white text-indigo-900 py-3 rounded-full hover:bg-gray-100">
                Choose {title}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 text-center">
        <h3 className="text-4xl font-bold mb-12">Extend Your Tracking</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Custom Metrics',
              description: 'Track anything that matters to you.',
            },
            {
              title: 'Plugin Ecosystem',
              description: 'Build and share community plugins.',
            },
            {
              title: 'Infinite Flexibility',
              description: 'No limits to your habit tracking.',
            },
          ].map(({ title, description }, idx) => (
            <div
              key={idx}
              className="bg-white/10 p-8 rounded-2xl hover:bg-white/20 transition-colors"
            >
              <h4 className="text-2xl font-semibold mb-4">{title}</h4>
              <p className="text-white/80">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="container mx-auto px-6 py-8 text-center opacity-70">
        <p>© 2024 ACTracker. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ACTrackerLanding;
