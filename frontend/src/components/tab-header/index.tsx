import React, { type ReactNode } from 'react';
import { Box, Stack } from '@mui/material';

type TabHeaderLayoutProps = {
  leftNode?: ReactNode;
  rightNode?: ReactNode;
  children?: ReactNode;
  spacing?: number;
  padding?: number | string;
};

export const TabHeaderLayout: React.FC<TabHeaderLayoutProps> = ({
  leftNode,
  rightNode,
  children,
  spacing = 2,
  padding = 0,
}) => {
  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent={'space-between'}
        spacing={spacing}
        padding={padding}
        marginBottom={5}
        height={40}
      >
        <Box width={{ xs: '100%', sm: 'auto' }} pt={{ xs: 1, sm: 1 }}>
          {leftNode}
        </Box>
        <Box width={{ xs: '100%', sm: 'auto' }}>{rightNode}</Box>
      </Stack>
      {children && <Box mt={2}>{children}</Box>}
    </Box>
  );
};
