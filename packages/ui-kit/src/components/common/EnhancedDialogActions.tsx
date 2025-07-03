import { HTMLAttributes, ReactNode } from 'react';

import { DialogActions } from '../base';

export type EnhancedDialogActionsProps = {
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export const EnhancedDialogActions = ({
  children,
  ...rest
}: EnhancedDialogActionsProps) => {
  return <DialogActions {...rest}>{children}</DialogActions>;
};
