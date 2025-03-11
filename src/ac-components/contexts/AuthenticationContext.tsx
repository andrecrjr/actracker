import { get as auth } from '@api/lambda/auth';
import { useLoaderData } from '@modern-js/runtime/router';
import React, {
  ReactElement,
  createContext,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from 'react';

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
  userAuth,
}: { children: ReactElement; userAuth?: boolean }) => {
  const serverData = useLoaderData() as { userAuth?: boolean };

  const [data, setUserData] = useState({ isAuthenticated: false });

  const authentication = useCallback(async () => {
    const userData = await auth();
    startTransition(() => {
      setUserData(userData);
    });
    localStorage.setItem('userAuthenticated', JSON.stringify(userData));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && serverData.userAuth) authentication();
  }, []);
  return (
    <UserAuth.Provider value={{ ...data, setUserData }}>
      {children}
    </UserAuth.Provider>
  );
};
