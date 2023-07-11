import { EventHandler, FC, ReactNode, SyntheticEvent } from 'react';
import { Button } from '../base';

import { useIsMobile } from '../../hooks';

import { styled } from '../../styling';

const NavButtonBase = styled(Button)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  fontSize: 'x-small',
  color: theme.palette.primary.contrastText,

  //FIXME: use theme defined values -https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/19
  opacity: 0.8,
  '&:hover': {
    opacity: 1,
  },
  '& .MuiButton-startIcon': {
    //FIXME: use theme defined values -https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/19
    backgroundColor: '#00000033',
    padding: theme.spacing(1),
    margin: 0,
    borderRadius: theme.shape.borderRadius,
  },
  '&.active': {
    opacity: 1,
    '& .MuiButton-startIcon': {
      color: theme.palette.info.dark,
      backgroundColor:
        theme.palette.mode === 'light'
          ? theme.palette.common.white
          : theme.palette.info.light,
    },
  },
  [theme.breakpoints.down('tablet')]: {
    color:
      theme.palette.mode === 'light'
        ? theme.palette.primary.dark
        : theme.palette.common.white,

    //FIXME: use theme defined values -https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/19
    fontSize: 'xx-small',
    //FIXME: use theme defined values -https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/19
    flexBasis: '20%',
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
}

/**
 * renders a navigation button with styles and adopts based on screen size
 *
 * @property {string} label - button label
 * @property {ReactNode} icon - the icon for the button
 * @property {string} href - href property to set on the button
 * @property {boolean} isActive - if true the component will be rendered in active state
 */

export const NavigationButton: FC<NavButtonProps> = (props) => {
  const { label, icon, isActive, onClick } = props;

  const isMobile = useIsMobile();

  return (
    <NavButtonBase
      onClick={onClick}
      className={isActive ? 'active' : undefined}
      startIcon={icon}
      variant="text"
    >
      {isMobile && isActive ? '⬤' : label}
    </NavButtonBase>
  );
};
