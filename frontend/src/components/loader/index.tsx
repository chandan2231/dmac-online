import { Backdrop, CircularProgress, useTheme } from '@mui/material';

const CustomLoader = () => {
  const theme = useTheme();

  return (
    <Backdrop
      sx={{
        color: theme.colors?.loader ?? theme.palette.primary.main, // Uses theme's contrast color
        zIndex: theme.zIndex.drawer + 1,
      }}
      open={true}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default CustomLoader;
