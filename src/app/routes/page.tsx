import { App } from '@/ac-components/Pages/App';
import Test from '@/ac-components/components/PluginTest';
import { useLoaderData } from '@modern-js/runtime/router';
import React, { Suspense } from 'react';

const Index = () => {
  const serverData = useLoaderData();
  // console.log(serverData);
  return (
    <>
      <App />
    </>
  );
};
export default Index;
