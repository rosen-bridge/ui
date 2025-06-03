import React from 'react';

import { Stack } from '../base';

export interface ToolbarProps {
  children?: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children }) => {
  return (
    <Stack direction="row" spacing={1}>
      {children}
    </Stack>
  );
};
