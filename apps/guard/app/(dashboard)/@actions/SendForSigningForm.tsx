import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Alert } from '@rosen-bridge/icons';
import { useApiKey } from '@rosen-bridge/shared-contexts';
import {
  AlertCard,
  AlertProps,
  Button,
  Checkbox,
  FullCard,
  Grid,
  MenuItem,
  SubmitButton,
  TextField,
  Typography,
  styled,
} from '@rosen-bridge/ui-kit';
import { ApiKeyModal } from '@rosen-bridge/ui-kit';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';
import { mutatorWithHeaders } from '@rosen-ui/swr-helpers';
import { Network } from '@rosen-ui/types';
import useSWRMutation from 'swr/mutation';

import { ApiSignRequestBody, ApiSignResponse } from '@/_types/api';

const AlertIcon = styled(Alert)((theme) => ({
  fill: theme.palette.primary.main,
}));

interface Form {
  chain: Network;
  txJson: string;
  requiredSign: number;
  overwrite?: boolean;
}
/**
 * render a form for signing a tx
 */
export const SendForSigningForm = () => {
  const { apiKey } = useApiKey();

  const {
    trigger,
    isMutating: isSignPending,
    error,
  } = useSWRMutation<ApiSignResponse, any, '/sign', ApiSignRequestBody>(
    '/sign',
    mutatorWithHeaders,
  );

  const [alertData, setAlertData] = useState<{
    severity: AlertProps['severity'];
    message: string;
  } | null>(null);

  const { handleSubmit, register, reset, formState } = useForm({
    defaultValues: {
      txJson: '',
      chain: '' as Network,
      requiredSign: 10,
      overwrite: undefined,
    },
  });

  const onSubmit: SubmitHandler<Form> = async (data) => {
    if (!apiKey) return;

    try {
      const { txJson, chain, requiredSign, overwrite } = data;
      const response = await trigger({
        data: {
          txJson,
          chain,
          requiredSign,
          overwrite,
        },
        headers: {
          'Api-Key': apiKey,
        },
      });

      if (response.message === 'Ok') {
        setAlertData({
          severity: 'success',
          message: `Sign operation successful.`,
        });
        reset();
      } else {
        throw new Error(
          'Server responded but the response message was unexpected',
        );
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        setAlertData({
          severity: 'error',
          message: 'The Api key is not correct',
        });
      } else {
        setAlertData({
          severity: 'error',
          message:
            error.response?.status === 409
              ? 'Tx is already sent for signing. If you want to override, click the checkbox and submit again.'
              : error.message,
        });
      }
    }
  };

  const renderAlert = () => (
    <AlertCard
      severity={alertData?.severity}
      onClose={() => setAlertData(null)}
    >
      {alertData?.message}
    </AlertCard>
  );

  return (
    <FullCard title="Send for Signing" backgroundColor="transparent">
      <form onSubmit={handleSubmit(onSubmit)}>
        {renderAlert()}

        <TextField
          select
          label="Chain"
          {...register('chain')}
          sx={{ mb: 2 }}
          fullWidth
        >
          {Object.keys(NETWORKS).map((key) => (
            <MenuItem key={key} value={NETWORKS[key as keyof typeof NETWORKS]}>
              {NETWORK_LABELS[key as keyof typeof NETWORKS]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Transaction"
          multiline
          rows={5}
          {...register('txJson')}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Required Signs"
          {...register('requiredSign')}
          sx={{ mb: 2 }}
        />

        {error?.response?.status === 409 && (
          <Grid container alignItems="center">
            <Checkbox {...register('overwrite')} />
            <Typography>Overwrite already sent transaction</Typography>
          </Grid>
        )}

        {error?.response?.status === 403 && (
          <Grid
            container
            alignItems="center"
            sx={(theme) => ({ color: theme.palette.warning.main })}
          >
            <Typography>The Api key is not correct</Typography>
          </Grid>
        )}

        {!apiKey && (
          <Grid
            container
            alignItems="center"
            gap={1}
            sx={(theme) => ({ color: theme.palette.warning.main })}
          >
            <Grid item>
              <Alert />
            </Grid>

            <Grid item>
              <Typography>You need to set an Api Key before sending</Typography>
            </Grid>

            <Grid item>
              <ApiKeyModal>
                {(open) => <Button onClick={open}>Click To Set</Button>}
              </ApiKeyModal>
            </Grid>
          </Grid>
        )}

        <SubmitButton loading={isSignPending} disabled={!apiKey}>
          Send
        </SubmitButton>
      </form>
    </FullCard>
  );
};
