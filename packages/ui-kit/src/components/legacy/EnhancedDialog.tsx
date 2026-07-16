import { HTMLAttributes, ReactNode } from 'react';

import { Breakpoint, Dialog } from '@mui/material';

import { useBreakpoint } from '../../hooks';

export type EnhancedDialogProps = {
  children?: ReactNode;
  open: boolean;
  maxWidth?: Breakpoint;
  stickOn: Breakpoint;
  onClose?: () => void;
} & HTMLAttributes<HTMLDivElement>;

/**
 * renders an enhanced version of material ui Dialog
 */
export const EnhancedDialog = ({
  children,
  open,
  maxWidth,
  stickOn,
  onClose,
}: EnhancedDialogProps) => {
  const stick = useBreakpoint(`${stickOn}-down`);
  return (
    <Dialog
      open={open}
      sx={
        stick
          ? {
              '& > .MuiDialog-container': {
                'alignItems': 'end',
                '& > .MuiPaper-root': {
                  margin: 0,
                  borderBottomRightRadius: 0,
                  borderBottomLeftRadius: 0,
                  width: '100%',
                },
              },
            }
          : {}
      }
      maxWidth={maxWidth}
      onClose={onClose}
    >
      {children}
    </Dialog>
  );
};
