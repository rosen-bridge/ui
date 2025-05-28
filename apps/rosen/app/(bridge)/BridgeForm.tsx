import { useEffect, useMemo } from 'react';

import {
  Card,
  Grid,
  InputSelect,
  InputSelectNetwork,
  InputSelectNetworkProps,
  InputSelectProps,
  InputText,
  LoadingButton,
  Stack,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { Network, RosenAmountValue } from '@rosen-ui/types';
import { Network as NetworkKey } from '@rosen-ui/types';

import { validateAddress } from '@/_actions';
import { useTokenMap } from '@/_hooks';
import { networks } from '@/_networks';
import { unwrap } from '@/_safeServerAction';

import { useBridgeForm } from './useBridgeForm';

export type FormData = {
  source: string | null;
  target: string | null;
  token: string | null;
  walletAddress: string | null;
  amount: RosenAmountValue | null;
};

const BridgeForm = () => {
  const [fields, methods, FormProvider, Form] = useBridgeForm();
  const { reset, handleSubmit, watch, setValue } = methods;

  return (
    <FormProvider>
      <Form>
        <Grid container spacing={2}>
          <Grid item mobile={12} desktop={8}>
            <Grid container spacing={2}>
              <Grid item mobile={12} tablet={6}>
                <InputSelectNetwork
                  {...(fields.source as InputSelectNetworkProps<any>)}
                />
              </Grid>
              <Grid item mobile={12} tablet={6}>
                <InputSelect
                  // name="target"
                  // label="Target"
                  // options={sources}
                  // rules={{ required: 'This is required.' }}
                  // disabled={!watch('source')}
                  {...(fields.target as InputSelectProps<any>)}
                  //  {...fields.target}
                />
              </Grid>
              <Grid item mobile={12}>
                <InputText
                  // name="token"
                  // label="Token"
                  // disabled={!watch('target')}
                  {...fields.token}
                />
              </Grid>
              <Grid item mobile={12}>
                <InputText
                  name="amount"
                  label="Amount"
                  rules={{
                    required: 'This is required.',
                    onChange: (e) => {
                      console.log('zzz onChange amount', e.target.value);
                    },
                    pattern: {
                      value: /^\d+(\.\d+)?$/,
                      message: 'Invalid amount format',
                    },
                  }}
                  disabled={!watch('token')}
                />
              </Grid>
              <Grid item mobile={12}>
                <InputText
                  name="walletAddress"
                  label="Target Address"
                  enablePasteButton
                  rules={{
                    onChange: (e) => {
                      setValue('walletAddress', e.target.value.trim());
                      console.log('zzz onChange walletAddress', e.target.value);
                    },
                    validate: async (value) => {
                      const targetNetwork = watch('target');
                      console.log(
                        'zzz validate walletAddress',
                        value,
                        targetNetwork,
                      );
                      if (!value) {
                        return 'Address is required!';
                      }
                      if (!targetNetwork) {
                        return 'Target network is not selected!';
                      }
                      const isValid = await unwrap(validateAddress)(
                        targetNetwork as Network,
                        networks[targetNetwork as Network].toSafeAddress(value),
                      );
                      if (isValid) return;
                      return 'Address is invalid!';
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item mobile={12} desktop={4}>
            <Stack spacing={2} height="100%">
              <Card sx={{ p: 2 }}>Wallet Card</Card>
              <Card sx={{ p: 2, flexGrow: 1 }}>Transaction Card</Card>
            </Stack>
          </Grid>
          <Grid item mobile></Grid>
          <Grid item mobile={12} tablet={6} desktop={4}>
            <LoadingButton type="submit" fullWidth>
              Submit
            </LoadingButton>
          </Grid>
          <Grid item mobile></Grid>
        </Grid>
      </Form>
    </FormProvider>
  );
};

export default BridgeForm;
