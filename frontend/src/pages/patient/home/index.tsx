import Home from '../../../features/patient/home';
import withAuthRedirect from '../../../middlewares/withAuthRedirect';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { ROUTES } from '../../../router/router';

const HomePage = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.role === 'USER') {
      navigate(ROUTES.CONSENT, { replace: true });
    }
  }, [navigate, user?.role]);

  return <Home />;
};

const AuthRedirectHomePage = withAuthRedirect(HomePage);

export default AuthRedirectHomePage;
