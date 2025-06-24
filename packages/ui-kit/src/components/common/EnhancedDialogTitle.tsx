import { MouseEventHandler, ReactNode } from 'react';

import { styled } from '@mui/material';
import { Times } from '@rosen-bridge/icons';

import { useBreakpoint } from '../../hooks';
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
};

/**
 * renders an enhanced version of material ui DialogTitle
 */
export const EnhancedDialogTitle = ({
  children,
  icon,
  onClose,
}: EnhancedDialogTitleProps) => {
  const isMobile = useBreakpoint('mobile');
  return (
    <DialogTitle
      display="flex"
      alignItems="center"
      flexDirection={isMobile ? 'column' : 'row'}
      gap={2}
    >
      {!isMobile && icon && (
        <IconContainer>
          <SvgIcon sx={{ height: 20, width: 20 }}>{icon}</SvgIcon>
        </IconContainer>
      )}
      <span style={{ flexGrow: 1 }}>{children}</span>
      {!isMobile && onClose && (
        <IconButton onClick={onClose}>
          <SvgIcon>
            <Times />
          </SvgIcon>
        </IconButton>
      )}
    </DialogTitle>
  );
};
