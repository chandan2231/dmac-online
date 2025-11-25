import React from 'react';
import { styled } from '@mui/material/styles';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

interface IModernCalendarProps
  extends React.ComponentProps<typeof DateCalendar> {
  elevation?: number;
}

const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  width: 'fit-content',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${theme.colors?.inputBorder || theme.palette.divider}`,
  overflow: 'hidden',
}));

const ModernCalendar = ({ elevation = 0, ...props }: IModernCalendarProps) => {
  return (
    <Wrapper>
      <StyledPaper elevation={elevation}>
        <DateCalendar {...props} />
      </StyledPaper>
    </Wrapper>
  );
};

export default ModernCalendar;
