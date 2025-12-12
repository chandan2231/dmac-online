import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PUBLIC_ROUTES } from '../../router/router';
import CustomLoader from '../../components/loader';

const NonProtectedBoundary = () => {
  return (
    <Suspense fallback={<CustomLoader />}>
      <Routes>
        {PUBLIC_ROUTES.map(({ path, component, layout: Layout }, i) => {
          return (
            <Route key={i} element={<Layout />}>
              <Route path={path} element={React.createElement(component)} />
            </Route>
          );
        })}
      </Routes>
    </Suspense>
  );
};

export default NonProtectedBoundary;
