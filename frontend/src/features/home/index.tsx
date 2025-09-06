import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../auth/auth.interface';
import { get } from 'lodash';
import { useLanguageConstants } from '../../providers/language-constant-provider/hooks/useLanguageConstants';
import MorenButton from '../../components/button';

const Home = () => {
  const navigate = useNavigate();
  const { languageConstants } = useLanguageConstants();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Box
      display="flex"
      sx={{
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: 2,
      }}
      gap={1}
    >
      <MorenButton
        variant="contained"
        sx={{
          maxWidth: '250px',
        }}
        onClick={() => handleNavigation(ROUTES.QUESTIONERS)}
      >
        {get(languageConstants, ['start'], '')}
      </MorenButton>
    </Box>
  );
};

export default Home;
