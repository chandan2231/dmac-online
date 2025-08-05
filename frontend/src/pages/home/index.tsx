import Home from '../../features/home';
import withAuthGuard from '../../middlewares/withAuthGuard';

const HomePage = () => {
  return <Home />;
};

const AuthGuardedHomePage = withAuthGuard(HomePage);

export default AuthGuardedHomePage;
