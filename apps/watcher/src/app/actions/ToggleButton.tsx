import { ReactNode } from 'react';

import {
  ToggleButtonProps,
  ToggleButton as UiKitToggleButton,
  styled,
} from '@rosen-bridge/ui-kit';

/**
 * wrap `UiKitToggleButton` to add some styling
 */
const ToggleButtonBase = styled(UiKitToggleButton)(({ theme }) => ({
  'minWidth': 100,
  'borderWidth': 0,
  'borderBottomRightRadius': 0,
  'borderBottomLeftRadius': 0,
  'display': 'flex',
  'flexDirection': 'column',
  'gap': theme.spacing(1),
  'color': 'white',
  'opacity': 0.8,
  '&:hover': {
    opacity: 1,
  },
  '&.Mui-selected': {
    opacity: 1,
    color: theme.palette.primary.main,
    background: `linear-gradient(180deg, ${theme.palette.background.default}aa 0%, ${theme.palette.background.default} 70%)`,
    borderTopLeftRadius: `${theme.shape.borderRadius / 2}px !important`,
    borderTopRightRadius: `${theme.shape.borderRadius / 2}px !important`,
  },
  '&.Mui-disabled': {
    border: 'none',
  },
}));

interface CustomToggleButtonProps extends ToggleButtonProps {
  label: string;
  icon: ReactNode;
}
/**
 * render a toggle button
 * @param label
 * @param icon
 */
export const ToggleButton = ({
  label,
  icon,
  ...restProps
}: CustomToggleButtonProps) => {
  return (
    <ToggleButtonBase {...restProps}>
      {icon} {label}
    </ToggleButtonBase>
  );
};
