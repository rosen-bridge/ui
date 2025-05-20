import { useEffect, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import {
  Card,
  Grid,
  InputSelectNetwork,
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

export type FormData = {
  source: string | null;
  target: string | null;
  token: string | null;
  walletAddress: string | null;
  amount: RosenAmountValue | null;
};

const BridgeForm = () => {
  const methods = useForm<FormData>({
    defaultValues: {
      source: null,
      target: null,
      token: null,
      walletAddress: null,
      amount: null,
    },
  });
  const { reset, handleSubmit, watch } = methods;

  const tokenMap = useTokenMap();
  const sources = useMemo(() => {
    return (tokenMap.getAllChains() as NetworkKey[])
      .filter((chain) => !!NETWORKS[chain])
      .map((chain) => networks[chain]);
  }, [tokenMap]);

  const onSubmit = handleSubmit((data) =>
    console.log('zzz handleSubmit', data),
  );

  useEffect(() => {
    const { unsubscribe } = watch((value, { name, type }) => {
      console.log('zzz useEffect', value, name, type);
      if (name === 'source') {
        reset({
          source: value.source,
          walletAddress: value.walletAddress,
        });
      } else if (name === 'target') {
        reset({
          source: value.source,
          target: value.target,
          walletAddress: value.walletAddress,
        });
      } else if (name === 'token') {
        reset({
          source: value.source,
          target: value.target,
          token: value.token,
          walletAddress: value.walletAddress,
        });
      }
    });
    return () => unsubscribe();
  }, [watch]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <Grid container spacing={2}>
          <Grid item mobile={12} desktop={8}>
            <Grid container spacing={2}>
              <Grid item mobile={12} tablet={6}>
                <InputSelectNetwork
                  name="source"
                  label="Source"
                  options={sources}
                  rules={{ required: true }}
                />
              </Grid>
              <Grid item mobile={12} tablet={6}>
                <InputSelectNetwork
                  name="target"
                  label="Target"
                  options={sources}
                  rules={{ required: true }}
                  disabled={!watch('source')}
                />
              </Grid>
              <Grid item mobile={12}>
                <InputText
                  name="token"
                  label="Token"
                  disabled={!watch('target')}
                />
              </Grid>
              <Grid item mobile={12}>
                <InputText
                  name="amount"
                  label="Amount"
                  disabled={!watch('token')}
                />
              </Grid>
              <Grid item mobile={12}>
                <InputText
                  name="walletAddress"
                  label="Target Address"
                  enablePasteButton
                  rules={{
                    validate: async (value) => {
                      const targetNetwork = watch('target');
                      console.log(
                        'zzz validate walletAddress',
                        value,
                        targetNetwork,
                      );
                      if (!value) {
                        return 'Address cannot be empty';
                      }
                      const isValid = await unwrap(validateAddress)(
                        targetNetwork as Network,
                        networks[targetNetwork as Network].toSafeAddress(value),
                      );
                      if (isValid) return;
                      return 'Invalid Address';
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
      </form>
    </FormProvider>
  );
};

export default BridgeForm;
