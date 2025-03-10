import { get as auth } from '@api/lambda/auth';
import React, {
  ReactElement,
  createContext,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useHabitStore } from '../hooks';

export const UserAuth = createContext<{
  isAuthenticated: boolean;
  userId?: string;
  token?: string;
  setUserData: React.Dispatch<
    React.SetStateAction<{
      isAuthenticated: boolean;
      token?: string;
      userId?: string;
    }>
  >;
}>({
  isAuthenticated: false,
  setUserData: () => {},
});

export const UserAuthenticationProvider = ({
  children,
}: { children: ReactElement }) => {
  const [data, setUserData] = useState({ isAuthenticated: false });

  const authentication = useCallback(async () => {
    const userData = await auth();
    startTransition(() => {
      setUserData(userData);
    });
    localStorage.setItem('userAuthenticated', JSON.stringify(userData));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') authentication();
  }, []);
  return (
    <UserAuth.Provider value={{ ...data, setUserData }}>
      {children}
    </UserAuth.Provider>
  );
};
