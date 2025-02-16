import { Outlet } from '@modern-js/runtime/router';
import './index.css';
import { HabitProvider } from '@/ac-components/hooks';

export default function Layout() {
  return (
    <>
      <HabitProvider>
        <Outlet />
      </HabitProvider>
    </>
  );
}
