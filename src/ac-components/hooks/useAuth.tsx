import { useContext } from 'react';
import { UserAuth } from '../contexts/AuthenticationContext';

export const useAuth = () => {
  const data = useContext(UserAuth);
  return data;
};
