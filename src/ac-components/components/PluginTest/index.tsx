'use client';
import { loadRemoteModule } from '@/app/utils';
import type React from 'react';

import { Suspense, lazy } from 'react';

const PluginComponent = lazy(() => {
  return loadRemoteModule(
    'http://localhost:3051/static/mf-manifest.json',
    'reminderPlugin',
    './ReminderPlugin',
  ).then(module => ({ default: module.default }));
});

const Test: React.FC = () => {
  return (
    <div>
      <p>teste</p>
      <Suspense fallback={<p>loading</p>}>
        <PluginComponent />
      </Suspense>
    </div>
  );
};

export default Test;
