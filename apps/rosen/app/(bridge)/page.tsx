'use client';

import { useForm, FormProvider } from 'react-hook-form';

import { Card, Divider, styled } from '@rosen-bridge/ui-kit';

import BridgeTransaction from './BridgeTransaction';
import BridgeForm from './BridgeForm';

const BridgeContainer = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '3fr auto 2fr',
  minWidth: 0,
  gap: theme.spacing(1.5),
  padding: theme.spacing(3),

  [theme.breakpoints.up('tablet')]: {
    maxWidth: '45%',
  },
}));

export interface BridgeForm {
  source: string | null;
  target: string | null;
  token: string | null;
  walletAddress: string | null;
  amount: number | null;
}

/**
 * bridge main layout
 */
const RosenBridge = () => {
  const methods = useForm<BridgeForm>({
    mode: 'onBlur',
    defaultValues: {
      source: '',
      target: '',
      token: '',
      walletAddress: null,
      amount: null,
    },
  });

  return (
    <FormProvider {...methods}>
      <BridgeContainer>
        <BridgeForm />
        <Divider orientation="vertical" flexItem />
        <BridgeTransaction />
      </BridgeContainer>
    </FormProvider>
  );
};

export default RosenBridge;
