import { HTMLAttributes, MouseEventHandler, ReactNode } from 'react';

import { styled } from '@mui/material';
import { Times } from '@rosen-bridge/icons';

import { DialogTitle, IconButton, SvgIcon } from '../base';

const IconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1.25),
  background: theme.palette.secondary.light,
  borderRadius: '50%',
}));

export type EnhancedDialogTitleProps = {
  children?: ReactNode;
  icon?: ReactNode;
  onClose?: MouseEventHandler<HTMLButtonElement>;
} & HTMLAttributes<HTMLHeadingElement>;

/**
 * renders an enhanced version of material ui DialogTitle
 */
export const EnhancedDialogTitle = ({
  children,
  icon,
  onClose,
}: EnhancedDialogTitleProps) => {
  return (
    <DialogTitle display="flex" alignItems="center" flexDirection="row" gap={2}>
      {icon && (
        <IconContainer>
          <SvgIcon sx={{ height: 20, width: 20 }}>{icon}</SvgIcon>
        </IconContainer>
      )}
      <span style={{ flexGrow: 1, whiteSpace: 'nowrap' }}>{children}</span>
      {onClose && (
        <IconButton onClick={onClose}>
          <SvgIcon>
            <Times />
          </SvgIcon>
        </IconButton>
      )}
    </DialogTitle>
  );
};
