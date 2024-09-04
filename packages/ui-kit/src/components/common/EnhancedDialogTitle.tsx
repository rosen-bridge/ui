import { styled } from '@mui/material';
import { Times } from '@rosen-bridge/icons';

import { DialogTitle, DialogTitleProps, IconButton, SvgIcon } from '../base';

const IconContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1.25),
  background: theme.palette.secondary.light,
  borderRadius: '50%',
}));

export type EnhancedDialogTitleProps = {
  closeable?: boolean;
  icon?: JSX.Element;
  onClose?: (event: {}) => void;
} & DialogTitleProps;

/**
 * renders an enhanced version of material ui DialogTitle
 */
export const EnhancedDialogTitle = ({
  icon,
  ...props
}: EnhancedDialogTitleProps) => {
  return (
    <DialogTitle {...props} display="flex" alignItems="center" gap={2}>
      {icon && (
        <IconContainer>
          <SvgIcon sx={{ height: 20, width: 20 }}>{icon}</SvgIcon>
        </IconContainer>
      )}
      <span style={{ flexGrow: 1 }}>{props.children}</span>
      {props.closeable && (
        <IconButton onClick={props.onClose}>
          <SvgIcon>
            <Times />
          </SvgIcon>
        </IconButton>
      )}
    </DialogTitle>
  );
};
