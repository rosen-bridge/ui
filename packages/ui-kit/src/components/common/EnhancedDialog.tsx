import { ReactNode, useCallback } from 'react';

import { Breakpoint, Dialog, Theme } from '@mui/material';

export type EnhancedDialogProps = {
  children?: ReactNode;
  open: boolean;
  maxWidth?: Breakpoint;
  stickOn: Breakpoint;
  onClose?: () => void;
};

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
  const sx = useCallback(
    (theme: Theme) => {
      const query =
        stickOn == 'mobile'
          ? theme.breakpoints.only(stickOn)
          : theme.breakpoints.down(stickOn);
      return {
        [query]: {
          '& > .MuiDialog-container': {
            'alignItems': 'end',
            '& > .MuiPaper-root': {
              margin: 0,
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
              width: '100%',
            },
          },
        },
      };
    },
    [stickOn],
  );
  return (
    <Dialog open={open} sx={sx} maxWidth={maxWidth} onClose={onClose}>
      {children}
    </Dialog>
  );
};
