import React from 'react';

import { StackMui } from '../base';

export interface ToolbarProps {
  children?: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children }) => {
  return (
    <StackMui direction="row" spacing={1}>
      {children}
    </StackMui>
  );
};
