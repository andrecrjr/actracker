import { useAuth } from '@/ac-components/hooks/useAuth';
import { LogOut } from 'lucide-react';
import React from 'react';
import { Button } from '../ui';

const SignOut: React.FC = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <Button
        variant="destructive"
        size="sm"
        className="text-muted-foreground text-white"
        onClick={logout}
        disabled={isLoading}
      >
        <LogOut className="h-4 w-4" />
        {isLoading ? 'Loading...' : 'Sign Out'}
      </Button>
    );
  }

  return <></>;
};

export default SignOut;
