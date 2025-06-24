import { PropsWithChildren } from 'react';

import { DialogContent } from '../base';

export const EnhancedDialogContent = ({ children }: PropsWithChildren) => {
  return <DialogContent>{children}</DialogContent>;
};
