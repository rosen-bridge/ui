import { FC, ReactNode } from 'react';
import { Button } from '../base';

import { useIsMobile } from '../../hooks';

import { styled } from '../../styling';

const NavButtonBase = styled(Button)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  fontSize: 'x-small',
  color: theme.palette.primary.contrastText,
  opacity: 0.8,
  '&:hover': {
    opacity: 1,
  },
  '& .MuiButton-startIcon': {
    backgroundColor: '#00000033',
    padding: theme.spacing(1),
    margin: 0,
    borderRadius: theme.shape.borderRadius,
  },
  '&.active': {
    opacity: 1,
    '& .MuiButton-startIcon': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.primary.dark
          : theme.palette.secondary.dark,
      backgroundColor:
        theme.palette.mode === 'light'
          ? theme.palette.common.white
          : theme.palette.secondary.light,
    },
  },
  [theme.breakpoints.down('tablet')]: {
    color:
      theme.palette.mode === 'light'
        ? theme.palette.primary.dark
        : theme.palette.common.white,
    fontSize: 'xx-small',
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
  href: string;
  isActive?: boolean;
}

/**
 * @description renders a navigation button with styles and adopts based on screen size
 *
 * @property {string} label - button label
 * @property {ReactNode} icon - the icon for the button
 * @property {string} href - href property to set on the button
 * @property {boolean} isActive - if true the component will be rendered in active state
 */

export const NavButton: FC<NavButtonProps> = (props) => {
  const { label, icon, isActive, href } = props;

  const isMobile = useIsMobile();

  return (
    <NavButtonBase
      href={href}
      className={isActive ? 'active' : undefined}
      startIcon={icon}
      variant="text"
    >
      {isMobile && isActive ? '⬤' : label}
    </NavButtonBase>
  );
};
