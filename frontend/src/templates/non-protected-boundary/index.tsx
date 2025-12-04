import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { PUBLIC_ROUTES } from '../../router/router';

const NonProtectedBoundary = () => {
  return (
    <Routes>
      {PUBLIC_ROUTES.map(({ path, component, layout: Layout }, i) => {
        return (
          <Route key={i} element={<Layout />}>
            <Route path={path} element={React.createElement(component)} />
          </Route>
        );
      })}
    </Routes>
  );
};

export default NonProtectedBoundary;
