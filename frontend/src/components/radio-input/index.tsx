// MorenRadio.tsx
import React from 'react';
import GlanceWrapper from '../glance-wrapper';
import Radio, { type RadioProps } from '@mui/material/Radio';
import { styled } from '@mui/material/styles';

interface MorenRadioProps extends RadioProps {
  showGlanceEffect?: boolean; // Optional prop to control the glance effect
}

// Customize styles to reflect Moren UI look
const StyledRadio = styled(Radio)(({ theme }) => ({
  color: theme.palette.primary.main,
  padding: '4px',

  '&.Mui-checked': {
    color: theme.palette.primary.main,
  },

  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderRadius: '50%',
  },

  // You can also style the radio circle
  '& .MuiSvgIcon-root': {
    fontSize: 24, // bigger icon
  },
}));

const MorenRadio = React.forwardRef<HTMLButtonElement, MorenRadioProps>(
  (props, ref) => {
    const { showGlanceEffect, ...restProps } = props;

    if (showGlanceEffect) {
      return (
        <GlanceWrapper>
          <StyledRadio ref={ref} {...restProps} />
        </GlanceWrapper>
      );
    }

    return <StyledRadio ref={ref} {...restProps} />;
  }
);

export default MorenRadio;
