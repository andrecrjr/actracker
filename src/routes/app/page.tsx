import { loadRemoteModule } from '@/utils';
import type React from 'react';

import { Suspense, lazy } from 'react';

// import { Container } from './styles';

const PluginComponent = lazy(() => {
  return loadRemoteModule(
    'http://localhost:3051/remoteEntry.js',
    'remote',
    './Button',
  )
    .then(module => ({ default: module.default }))
    .catch(() => {
      return { default: () => <p>plugin offline</p> };
    });
});

const test: React.FC = () => {
  return (
    <div>
      teste
      <Suspense fallback={<p>loading</p>}>
        <PluginComponent />
      </Suspense>
    </div>
  );
};

export default test;
