import Home from '../../features/home';
import withAuthGuard from '../../middlewares/withAuthGuard';

const HomePage = () => {
  return <Home />;
};

export default withAuthGuard(HomePage);
