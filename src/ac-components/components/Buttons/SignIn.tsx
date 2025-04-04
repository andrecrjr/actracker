import { useAuth } from '@/ac-components/hooks';
import { Link } from '@modern-js/runtime/router';
import { Cloud, Loader2 } from 'lucide-react';
import React from 'react';
import { Button } from '../ui';

const SignInCloudButton: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Button variant={'ghost'} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link to="/login">
        <Button variant={'ghost'}>
          <Cloud />
        </Button>
      </Link>
    );
  }

  return null;
};

export default SignInCloudButton;
