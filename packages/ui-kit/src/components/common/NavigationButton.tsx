import { EventHandler, FC, ReactNode, SyntheticEvent } from 'react';

import { useIsMobile } from '../../hooks';
import { isLegacyTheme } from '../../hooks/useTheme';
import { styled } from '../../styling';
import { Badge, Button, SvgIcon } from '../base';

const NavigationButtonIndicator = styled('div', {
  name: 'RosenNavigationButton',
  slot: 'indicator',
  overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
  height: theme.spacing(1),
  width: theme.spacing(3),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
}));

const NavButtonBase = styled(Button)(({ theme }) => ({
  'flexDirection': 'column',
  'fontSize': theme.typography.subtitle2.fontSize,
  'gap': theme.spacing(0.5),
  ...(isLegacyTheme(theme)
    ? {
        color: theme.palette.primary.contrastText,
      }
    : {
        gap: theme.spacing(1),
        color: theme.palette.primary.light,
        padding: theme.spacing(1),
        fontWeight: 700,
        lineHeight: 1,
      }),
  'opacity': 0.8,
  '&:hover': {
    opacity: 1,
  },
  '& .MuiButton-startIcon': {
    backgroundColor: theme.palette.background.shadow,
    padding: isLegacyTheme(theme) ? theme.spacing(1) : theme.spacing(1.5),
    margin: 0,
    borderRadius: theme.shape.borderRadius,
  },
  '& .MuiButton-startIcon > svg': {
    fontSize: '24px',
  },
  '&.active': {
    'opacity': 1,
    '& .MuiButton-startIcon': {
      'color': isLegacyTheme(theme)
        ? theme.palette.info.dark
        : theme.palette.primary.dark,
      'backgroundColor': isLegacyTheme(theme)
        ? theme.palette.mode === 'light'
          ? theme.palette.common.white
          : theme.palette.info.light
        : theme.palette.primary.light,
      '&  > svg': {
        fontSize: '32px',
      },
    },
  },
  [theme.breakpoints.down('tablet')]: {
    'color':
      theme.palette.mode === 'light'
        ? theme.palette.primary.dark
        : theme.palette.common.white,
    '& .MuiButton-startIcon': {
      backgroundColor: 'transparent',
      padding: 0,
    },
    '&.active': {
      '& .MuiButton-startIcon': {
        color:
          theme.palette.mode === 'light'
            ? theme.palette.primary.dark
            : theme.palette.common.white,
        backgroundColor: 'transparent',
      },
    },
  },
}));

interface NavButtonProps {
  label: string;
  icon: ReactNode;
  onClick: EventHandler<SyntheticEvent>;
  isActive?: boolean;
  disabled?: boolean;
  badge?: string;
}

/**
 * renders a navigation button with styles and adopts based on screen size
 *
 * @property {string} label - button label
 * @property {ReactNode} icon - the icon for the button
 * @property {string} href - href property to set on the button
 * @property {boolean} isActive - if true the component will be rendered in active state
 * @property {boolean} disabled - if true the component will be rendered in disabled state
 */

export const NavigationButton: FC<NavButtonProps> = (props) => {
  const { badge, label, icon, isActive, onClick, disabled } = props;

  const isMobile = useIsMobile();

  let startIcon = <SvgIcon>{icon}</SvgIcon>;

  if (badge)
    startIcon = (
      <Badge badgeContent={badge} color="primary">
        {startIcon}
      </Badge>
    );

  return (
    <NavButtonBase
      onClick={onClick}
      className={isActive ? 'active' : undefined}
      startIcon={startIcon}
      variant="text"
      disabled={disabled}
    >
      {isMobile && isActive ? <NavigationButtonIndicator /> : label}
    </NavButtonBase>
  );
};
