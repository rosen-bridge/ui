import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { Button, styled } from '@rosen-bridge/ui-kit';

/**
 * render an action button containing some possible children
 */
const HomeActionButtonBase = styled(Button)(({ theme }) => ({
  'display': 'flex',
  'flexDirection': 'column',
  'gap': theme.spacing(0.5),
  'color': theme.palette.primary.dark,
  'opacity': 0.8,
  'fontSize': theme.typography.subtitle2.fontSize,
  'flexBasis': '20%',
  '&:hover': {
    opacity: 1,
    backgroundColor: 'transparent',
  },
  '& .MuiButton-startIcon': {
    backgroundColor: theme.palette.primary.light,
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
export const HomeActionButton = ({
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
