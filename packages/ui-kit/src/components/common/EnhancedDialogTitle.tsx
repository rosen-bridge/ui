import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react';

import { styled } from '@mui/material';

import { DialogTitle } from '../base';
import { CloseButton } from '../closeButton';
import { Icon, type IconProps } from '../icon';

const IconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1.25),
  background: theme.palette.secondary.light,
  borderRadius: '50%',
}));

export type EnhancedDialogTitleProps = {
  children?: ReactNode;
  icon?: IconProps['name'];
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
          <Icon name={icon} />
        </IconContainer>
      )}
      <span style={{ flexGrow: 1, whiteSpace: 'nowrap' }}>{children}</span>
      {onClose && <CloseButton onClick={onClose} />}
    </DialogTitle>
  );
};
