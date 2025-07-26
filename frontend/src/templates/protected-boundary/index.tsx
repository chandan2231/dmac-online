import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { type IAuthState } from '../../features/auth/auth.interface';
import { COMPONENT_MAP, LAYOUT_MAP } from './mapping';
import PageNotFound from '../../pages/not-found';

interface IProtectedBoundaryProps {
  allowedRoutes: IAuthState['allowedRoutes'];
}

const ProtectedBoundary = ({ allowedRoutes = [] }: IProtectedBoundaryProps) => {
  return (
    <Routes>
      {/* Dynamically render routes from backend */}
      {allowedRoutes &&
        allowedRoutes.map(({ path, component, layout }, i) => {
          const Layout = LAYOUT_MAP[layout] || React.Fragment;
          const Component = COMPONENT_MAP[component] || PageNotFound;

          return (
            <Route key={i} element={<Layout />}>
              <Route path={path} element={<Component />} />
            </Route>
          );
        })}
    </Routes>
  );
};

export default ProtectedBoundary;
