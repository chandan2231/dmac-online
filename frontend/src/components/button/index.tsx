// MorenButton.tsx
import React from 'react';
import GlanceWrapper from '../glance-wrapper';
import Button, { type ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { get } from 'lodash';

interface MorenButtonProps extends ButtonProps {
  showGlanceEffect?: boolean; // Optional prop to control the glance effect
}

// Customize styles to reflect Moren UI look
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.morenButton?.borderRadius || '999px',
  textTransform: 'none',
  fontWeight: 400,
  padding: '8px 16px',
  boxShadow: 'none',
  fontSize: '16px',
  width: '100%',
  height: theme.morenButton?.height || '36px',

  '&:hover': {
    boxShadow: theme.shadows[2],
  },

  '&.MuiButton-contained': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },

  '&.MuiButton-outlined': {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const MorenButton = React.forwardRef<HTMLButtonElement, MorenButtonProps>(
  (props, ref) => {
    const showGlanceEffect = get(props, ['showGlanceEffect'], false);

    if (showGlanceEffect) {
      // If the glance effect is enabled, wrap the button in a GlanceWrapper
      return (
        <GlanceWrapper>
          <StyledButton ref={ref} {...props} />
        </GlanceWrapper>
      );
    }

    return <StyledButton ref={ref} {...props} />;
  }
);

export default MorenButton;
