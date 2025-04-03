import { Outlet, useLoaderData } from '@modern-js/runtime/router';
import './index.css';
import { Toaster } from '@/ac-components/components/ui/toaster';
import { UserAuthenticationProvider } from '@/ac-components/contexts/AuthenticationContext';
import { HabitProvider } from '@/ac-components/hooks';
import { useRuntimeContext } from '@modern-js/runtime';
import { Helmet } from '@modern-js/runtime/head';

export default function Layout() {
  return (
    <>
      <Helmet>
        <title>Personal Tracker App - AC Tracker</title>
      </Helmet>
      <UserAuthenticationProvider>
        <>
          <Outlet />
          <Toaster />
        </>
      </UserAuthenticationProvider>
    </>
  );
}
