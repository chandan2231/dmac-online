import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../features/auth/auth.interface';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

/**
 * Redirects the user based on authentication status.
 * If a token exists, redirects to HOME. Otherwise, redirects to LOGIN.
 */
const useAuthRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME, { replace: true });
    } else {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isAuthenticated, navigate]);
};

export default useAuthRedirect;
