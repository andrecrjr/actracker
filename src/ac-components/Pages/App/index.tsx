import Home from '@/ac-components/components/Home';
import React, { lazy, Suspense } from 'react';

export const App: React.FC = () => {
  return (
    <Suspense fallback={<p>Loading</p>}>
      <Home />
    </Suspense>
  );
};
