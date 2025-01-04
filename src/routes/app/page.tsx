'use client';
import Test from '@/components/PluginTest';
import { loadRemoteModule } from '@/utils';
import type React from 'react';

import { Suspense, lazy } from 'react';

const test: React.FC = () => {
  return (
    <div>
      <Test />
    </div>
  );
};

export default test;
