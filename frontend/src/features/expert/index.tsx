import { Box } from '@mui/material';
import MorenButton from '../../components/button';
import ExpertService from './expert.service';

const ExportHome = () => {
  const handleGoogleAuth = async () => {
    const response = await ExpertService.getGoogleAuthUrl();
    if (response.success && response.url) {
      window.location.href = response.url;
    } else {
      console.error(response.message);
    }
  };
  return (
    <Box>
      <MorenButton variant="contained" onClick={() => handleGoogleAuth()}>
        Auth With Google
      </MorenButton>
    </Box>
  );
};

export default ExportHome;
