import { useAuth } from '@/ac-components/hooks/useAuth';
import { Link, router } from '@modern-js/runtime/router';
import { LogOut } from 'lucide-react';
import React from 'react';
import { Button } from '../ui';

// import { Container } from './styles';

const SignOut: React.FC = () => {
  const data = useAuth();

  if (data.isAuthenticated)
    return (
      <Link to="/logout">
        <Button
          variant="destructive"
          size="sm"
          className="text-muted-foreground text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </Link>
    );

  return <></>;
};

export default SignOut;
