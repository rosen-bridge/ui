import { Button } from '@mui/material';

import { useIsMobile, useFramework } from '../../../hooks';
import { alpha, styled } from '../../../styling';
import { Badge } from '../../base';
import { Icon, IconOverriddenProps } from '../../icon';
import { Link } from '../../link';

const NavigationButtonBase = styled(Button)(({ theme }) => ({
  'flexDirection': 'column',
  'fontSize': theme.typography.subtitle2.fontSize,
  'gap': theme.spacing(1),
  'color': theme.palette.common.white,
  'backgroundColor': 'transparent!important',
  'padding': theme.spacing(1),
  'fontWeight': 700,
  'lineHeight': 1,
  'opacity': 0.8,
  '&:hover': {
    opacity: 1,
  },
  '& .MuiButton-startIcon': {
    backgroundColor: alpha(theme.palette.common.black, 0.25),
    padding: theme.spacing(1.5),
    margin: 0,
    borderRadius: theme.shape.borderRadius,
  },
  '& .MuiButton-startIcon > svg': {
    fontSize: '24px',
  },
  '&.Mui-disabled': {
    color: alpha(theme.palette.common.white, 0.3),
  },
  '&.active': {
    'opacity': 1,
    'color':
      theme.palette.mode === 'light'
        ? theme.palette.common.white
        : theme.palette.primary.main,
    '& .MuiButton-startIcon': {
      color:
        theme.palette.mode === 'light'
          ? alpha(theme.palette.common.black, 0.8)
          : theme.palette.primary.contrastText,
      backgroundColor:
        theme.palette.mode === 'light'
          ? theme.palette.common.white
          : theme.palette.primary.main,
    },
  },
  [theme.breakpoints.down('tablet')]: {
    'color': theme.palette.primary.main,
    '& .MuiButton-startIcon': {
      backgroundColor: 'transparent',
      padding: 0,
    },
    '&.active': {
      '& .MuiButton-startIcon': {
        'color': theme.palette.primary.main,
        'backgroundColor': 'transparent',
        '&  > svg': {
          fontSize: '32px',
        },
      },
    },
    '&.Mui-disabled': {
      color: theme.palette.text.disabled,
    },
  },
}));

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

export type NavigationButtonProps = {
  label: string;
  icon: IconOverriddenProps['name'];
  path: string;
  disabled?: boolean;
  badge?: string;
};

/**
 * renders a navigation button with styles and adopts based on screen size
 *
 * @property {string} label - button label
 * @property {string} icon - the icon for the button
 * @property {string} href - href property to set on the button
 * @property {boolean} isActive - if true the component will be rendered in active state
 * @property {boolean} disabled - if true the component will be rendered in disabled state
 */
export const NavigationButton = ({
  badge,
  label,
  icon,
  path,
  disabled,
}: NavigationButtonProps) => {
  const { router } = useFramework();

  const isActive = router.pathname === path;

  const isMobile = useIsMobile();

  let startIcon = <Icon name={icon} />;

  if (badge)
    startIcon = (
      <Badge badgeContent={badge} color="secondary">
        {startIcon}
      </Badge>
    );

  return (
    <NavigationButtonBase
      href={path}
      LinkComponent={(props) => <Link {...props} underline="none" />}
      className={isActive ? 'active' : undefined}
      startIcon={startIcon}
      variant="text"
      disabled={disabled}
      disableRipple
    >
      {isMobile && isActive ? <NavigationButtonIndicator /> : label}
    </NavigationButtonBase>
  );
};
