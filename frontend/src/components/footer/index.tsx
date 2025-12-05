import { Box, Typography } from '@mui/material';
import { getCurrentYear } from '../../utils/functions';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 4,
        mt: 'auto',
        backgroundColor: theme => theme.palette.background.default,
        width: '100%',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="textSecondary">
        © {getCurrentYear()} RM360 Global. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
