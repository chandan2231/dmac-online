import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../features/auth/auth.interface';

function withAuthRedirect<P extends React.PropsWithChildren<unknown>>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithAuthRedirect = (props: P) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
      if (!isAuthenticated) {
        navigate(ROUTES.LOGIN); // Redirect to login page if not authenticated
      }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
      return null; // or a loader, or fallback UI while redirecting
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuthRedirect;
}

export default withAuthRedirect;
