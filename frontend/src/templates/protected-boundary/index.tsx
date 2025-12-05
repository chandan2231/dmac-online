import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { type IAuthState } from '../../features/auth/auth.interface';
import { COMPONENT_MAP, LAYOUT_MAP } from '../../router/router';
import CustomLoader from '../../components/loader';

interface IProtectedBoundaryProps {
  allowedRoutes: IAuthState['allowedRoutes'];
}

const ProtectedBoundary = ({ allowedRoutes = [] }: IProtectedBoundaryProps) => {
  return (
    <Suspense fallback={<CustomLoader />}>
      <Routes>
        {/* Dynamically render routes from backend */}
        {allowedRoutes &&
          allowedRoutes.map(({ path, component, layout }, i) => {
            const Layout = LAYOUT_MAP[layout] || React.Fragment;
            const Component =
              COMPONENT_MAP[component] || COMPONENT_MAP['PageNotFound'];

            return (
              <Route key={i} element={<Layout />}>
                <Route path={path} element={<Component />} />
              </Route>
            );
          })}
      </Routes>
    </Suspense>
  );
};

export default ProtectedBoundary;
