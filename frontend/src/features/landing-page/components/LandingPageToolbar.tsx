import { styled } from '@mui/material/styles';
import MuiToolbar from '@mui/material/Toolbar';

const LandingPageToolbar = styled(MuiToolbar)(({ theme }) => ({
  height: 64,
  [theme.breakpoints.up('sm')]: {
    height: 70,
  },
}));

export default LandingPageToolbar;
