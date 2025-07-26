import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

function withAuthGuard<P extends React.PropsWithChildren<unknown>>(
  WrappedComponent: React.ComponentType<P>
) {
  const ComponentWithAuthGuard = (props: P) => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    if (!isAuthenticated) {
      return null; // User not authenticated, show nothing
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuthGuard;
}

export default withAuthGuard;
