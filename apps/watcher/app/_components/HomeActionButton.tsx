import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { Button, styled } from '@rosen-bridge/ui-kit';

/**
 * render an action button containing some possible children
 */
const HomeActionButtonBase = styled(Button)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  color:
    theme.palette.mode === 'light'
      ? theme.palette.primary.dark
      : theme.palette.text.primary,
  opacity: 0.8,
  fontSize: theme.typography.subtitle2.fontSize,
  flexBasis: '20%',
  '&:hover': {
    opacity: 1,
    backgroundColor: 'transparent',
  },
  '& .MuiButton-startIcon': {
    backgroundColor:
      theme.palette.mode === 'light'
        ? theme.palette.primary.light
        : theme.palette.primary.dark,
    padding: theme.spacing(2),
    margin: 0,
    borderRadius: theme.shape.borderRadius,
  },
  [theme.breakpoints.down('tablet')]: {
    opacity: 1,
  },
}));

interface HomeActionButtonProps {
  label: string;
  icon: ReactNode;
  action: 'lock' | 'pause' | 'stop' | 'unlock' | 'withdraw';
  disabled?: boolean;
}
/**
 * render an action button in home page
 * @param label
 * @param icon
 * @param action
 * @param disabled
 */
const HomeActionButton = ({
  label,
  icon,
  action,
  disabled,
}: HomeActionButtonProps) => {
  const router = useRouter();

  return (
    <HomeActionButtonBase
      startIcon={icon}
      onClick={() => router.push(`/actions/${action}`)}
      disabled={disabled}
    >
      {label}
    </HomeActionButtonBase>
  );
};

export default HomeActionButton;
