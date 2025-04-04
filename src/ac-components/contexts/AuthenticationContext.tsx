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
import { useToast } from '../hooks/use-toast';

interface AuthState {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  token?: string;
  isLoading: boolean;
  error?: string;
}

interface AuthContextType extends AuthState {
  setUserData: React.Dispatch<React.SetStateAction<AuthState>>;
  refreshAuth: () => Promise<void>;
  logout: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: undefined,
};

export const UserAuth = createContext<AuthContextType>({
  ...initialState,
  setUserData: () => {},
  refreshAuth: async () => {},
  logout: () => {},
});

export const UserAuthenticationProvider = ({
  children,
}: { children: ReactElement }) => {
  const serverData = useLoaderData() as { userAuth?: boolean };
  const { toast } = useToast();
  const [data, setUserData] = useState<AuthState>({
    ...initialState,
    isLoading: serverData?.userAuth || false,
  });

  const refreshAuth = useCallback(async () => {
    try {
      setUserData(prev => ({ ...prev, isLoading: true, error: undefined }));
      const userData = await auth();

      startTransition(() => {
        setUserData(prev => ({
          ...prev,
          ...userData,
          isLoading: false,
        }));
      });

      // Only store in localStorage if authenticated
      if (userData.isAuthenticated) {
        localStorage.setItem('userAuthenticated', JSON.stringify(userData));
      } else {
        localStorage.removeItem('userAuthenticated');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setUserData(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to authenticate. Please try again.',
      }));
      toast({
        title: 'Authentication Error',
        description: 'Failed to authenticate. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const logout = useCallback(() => {
    // Client-side logout - will redirect to server for actual cookie clearing
    window.location.href = '/logout';
  }, []);

  // Initialize authentication on mount if token exists
  useEffect(() => {
    // Check if we're in the browser and if server indicated we have a token
    if (typeof window !== 'undefined') {
      // Try to get cached auth data while we refresh
      const cachedAuth = localStorage.getItem('userAuthenticated');
      if (cachedAuth) {
        try {
          const parsedAuth = JSON.parse(cachedAuth);
          setUserData(prev => ({
            ...prev,
            ...parsedAuth,
            isLoading: true, // Still mark as loading since we'll refresh
          }));
        } catch (e) {
          // Invalid JSON in localStorage, ignore it
          localStorage.removeItem('userAuthenticated');
        }
      }

      // If server indicates we have auth, refresh the auth data
      if (serverData?.userAuth) {
        refreshAuth();
      }
    }
  }, [serverData?.userAuth, refreshAuth]);

  // Set up a timer to refresh the token periodically (every 30 minutes)
  useEffect(() => {
    if (typeof window !== 'undefined' && data.isAuthenticated) {
      const refreshInterval = setInterval(
        () => {
          refreshAuth();
        },
        30 * 60 * 1000,
      ); // 30 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [data.isAuthenticated, refreshAuth]);

  return (
    <UserAuth.Provider value={{ ...data, setUserData, refreshAuth, logout }}>
      {children}
    </UserAuth.Provider>
  );
};
