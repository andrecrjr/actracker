import { useAuth } from '@/ac-components/hooks';
import { Link } from '@modern-js/runtime/router';
import { Cloud } from 'lucide-react';
import React from 'react';
import { Button } from '../ui';

// import { Container } from './styles';

const SignInCloudButton: React.FC = () => {
  const data = useAuth();

  if (!data.isAuthenticated)
    return (
      <Link to="/login">
        <Button variant={'ghost'}>
          <Cloud />
        </Button>
      </Link>
    );
  return null;
};

export default SignInCloudButton;
