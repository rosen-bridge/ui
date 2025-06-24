import { HTMLAttributes, ReactNode } from 'react';

import { DialogContent } from '../base';

export type EnhancedDialogContentProps = {
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export const EnhancedDialogContent = ({
  children,
  ...rest
}: EnhancedDialogContentProps) => {
  return <DialogContent {...rest}>{children}</DialogContent>;
};
