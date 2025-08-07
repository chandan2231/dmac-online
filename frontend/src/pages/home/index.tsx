import Home from '../../features/home';
import withAuthRedirect from '../../middlewares/withAuthRedirect';

const HomePage = () => {
  return <Home />;
};

const AuthRedirectHomePage = withAuthRedirect(HomePage);

export default AuthRedirectHomePage;
