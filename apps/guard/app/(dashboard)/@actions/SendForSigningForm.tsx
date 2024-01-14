import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import useSWRMutation from 'swr/mutation';

import {
  AlertCard,
  AlertProps,
  Checkbox,
  FullCard,
  Grid,
  MenuItem,
  SubmitButton,
  TextField,
  Typography,
} from '@rosen-bridge/ui-kit';
import { mutator } from '@rosen-ui/swr-helpers';

import { ApiSignRequestBody, ApiSignResponse } from '@/_types/api';

interface Form {
  chain: string;
  txJson: string;
  requiredSign: number;
  overwrite?: boolean;
}
/**
 * render a form for signing a tx
 */
const SendForSigningForm = () => {
  const {
    trigger,
    isMutating: isSignPending,
    error,
  } = useSWRMutation<ApiSignResponse, any, '/sign', ApiSignRequestBody>(
    '/sign',
    mutator,
  );

  const [alertData, setAlertData] = useState<{
    severity: AlertProps['severity'];
    message: string;
  } | null>(null);

  const { handleSubmit, register, reset } = useForm({
    defaultValues: {
      txJson: '',
      chain: '',
      requiredSign: 10,
      overwrite: undefined,
    },
  });

  const onSubmit: SubmitHandler<Form> = async (data) => {
    try {
      const { txJson, chain, requiredSign, overwrite } = data;
      const response = await trigger({
        txJson,
        chain,
        requiredSign,
        overwrite,
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
      setAlertData({
        severity: 'error',
        message:
          error.response?.status === 409
            ? 'Tx is already sent for signing. If you want to override, click the checkbox and submit again.'
            : error.message,
      });
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
          <MenuItem value="ergo">Ergo</MenuItem>
          <MenuItem value="cardano">Cardano</MenuItem>
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

        <SubmitButton loading={isSignPending}>Send</SubmitButton>
      </form>
    </FullCard>
  );
};

export default SendForSigningForm;
