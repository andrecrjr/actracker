import Home from '@/components/Home';
import { loadRemoteModule } from '@/utils';
import type React from 'react';

import { Suspense, lazy } from 'react';

const test: React.FC = () => {
  return (
    <div>
      <Home />
    </div>
  );
};

export default test;
