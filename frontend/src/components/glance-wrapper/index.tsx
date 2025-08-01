import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

const GlanceWrapper = styled(Box)(({ theme }) => {
  const shineColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(255, 255, 255, 0.3)';

  return {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-block',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: `linear-gradient(
        120deg,
        rgba(255,255,255,0) 0%,
        ${shineColor} 50%,
        rgba(255,255,255,0) 100%
      )`,
      transform: 'translateX(-100%) rotate(25deg)',
      transition: `transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
      pointerEvents: 'none',
      zIndex: 2,
    },

    '&:hover::before': {
      transform: 'translateX(100%) rotate(25deg)',
    },

    '& > *': {
      position: 'relative',
      zIndex: 1,
    },
  };
});

export default GlanceWrapper;
