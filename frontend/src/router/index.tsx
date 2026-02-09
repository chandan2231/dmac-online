import React from 'react';
import type { RootState } from '../store';
import { useSelector } from 'react-redux';
import { getRoutesByRole } from './router';

// Boundaries
import ProtectedBoundary from '../templates/protected-boundary';
import NonProtectedBoundary from '../templates/non-protected-boundary';

const AppRouter = () => {
  const { isAuthenticated, allowedRoutes, user } = useSelector(
    (state: RootState) => state.auth
  );

  const effectiveAllowedRoutes = user?.role ? getRoutesByRole(user.role) : allowedRoutes;

  return (
    <React.Fragment>
      {!isAuthenticated && <NonProtectedBoundary />}
      {isAuthenticated && (
        <ProtectedBoundary allowedRoutes={effectiveAllowedRoutes} />
      )}
    </React.Fragment>
  );
};

export default AppRouter;
