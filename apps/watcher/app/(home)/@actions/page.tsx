'use client';

import {
  LockAlt,
  MoneyWithdrawal,
  Pause,
  SquareShape,
  Unlock,
} from '@rosen-bridge/icons';
import { Button, Divider, Stack, styled, SvgIcon } from '@rosen-bridge/ui-kit';

import { useRouter } from 'next/navigation';

const HomeActionButtonBase = styled(Button)(({ theme }) => ({
  'display': 'flex',
  'flexDirection': 'column',
  'gap': theme.spacing(0.5),
  'borderRadius': 0,
  'color': theme.palette.primary.main,
  'backgroundColor': theme.palette.primary.light,
  'flexBasis': '20%',
  '&:hover': {
    'color': theme.palette.primary.contrastText,
    'backgroundColor': theme.palette.primary.dark,
  },
  [theme.breakpoints.down('tablet')]: {
    'fontSize': 0,
    'gap': 0
  },
}));


const Actions = () => {
  const router = useRouter();

  return (
    <Stack
      direction='row'
      style={{
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      <HomeActionButtonBase
        startIcon={
          <SvgIcon>
            <MoneyWithdrawal />
          </SvgIcon>
        }
        onClick={() => router.push('/actions/withdraw')}
      >
        Withdraw
      </HomeActionButtonBase>
      <Divider orientation='vertical' />
      <HomeActionButtonBase
        disabled={true}
        startIcon={
          <SvgIcon>
            <Pause />
          </SvgIcon>
        }
        onClick={() => router.push('/actions/pause')}
      >
        Pause
      </HomeActionButtonBase>
      <Divider orientation='vertical' />
      <HomeActionButtonBase
        disabled={true}
        startIcon={
          <SvgIcon>
            <SquareShape />
          </SvgIcon>
        }
        onClick={() => router.push('/actions/stop')}
      >
        Stop
      </HomeActionButtonBase>
      <Divider orientation='vertical' />
      <HomeActionButtonBase
        startIcon={
          <SvgIcon>
            <LockAlt />
          </SvgIcon>
        }
        onClick={() => router.push('/actions/lock')}
      >
        Lock
      </HomeActionButtonBase>
      <Divider orientation='vertical' />
      <HomeActionButtonBase
        startIcon={
          <SvgIcon>
            <Unlock />
          </SvgIcon>
        }
        onClick={() => router.push('/actions/unlock')}
      >
        Unlock
      </HomeActionButtonBase>
    </Stack>
  );
};

export default Actions;
