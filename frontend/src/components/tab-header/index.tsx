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
        direction="row"
        alignItems="center"
        spacing={spacing}
        padding={padding}
      >
        <Box>{leftNode}</Box>
        <Box>{rightNode}</Box>
      </Stack>
      {children && <Box mt={2}>{children}</Box>}
    </Box>
  );
};
