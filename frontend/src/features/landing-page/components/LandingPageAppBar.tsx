import MuiAppBar, { type AppBarProps } from '@mui/material/AppBar';

function LandingPageAppBar(props: AppBarProps) {
  return <MuiAppBar elevation={0} position="fixed" {...props} />;
}

export default LandingPageAppBar;
