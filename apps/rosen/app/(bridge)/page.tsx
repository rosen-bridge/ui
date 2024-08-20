'use client';

import { useForm, FormProvider } from 'react-hook-form';

import { Grid } from '@rosen-bridge/ui-kit';

import BridgeTransaction from './BridgeTransaction';
import BridgeForm from './BridgeForm';
import { RosenAmountValue } from '@rosen-ui/types';

export interface BridgeForm {
  source: string | null;
  target: string | null;
  token: string | null;
  walletAddress: string | null;
  amount: RosenAmountValue | null;
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
      <Grid container gap={2.5}>
        <Grid item mobile={12} tablet={7} desktop={8}>
          <BridgeForm />
        </Grid>
        <Grid item flexGrow={1}>
          <BridgeTransaction />
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default RosenBridge;
