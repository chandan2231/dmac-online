import React from 'react';
import { Outlet } from 'react-router-dom';

const BaseLayout = () => {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
};

export default BaseLayout;
