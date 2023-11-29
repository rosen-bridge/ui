import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import useSWRMutation from 'swr/mutation';

import {
  TextField,
  SubmitButton,
  AlertCard,
  AlertProps,
  Typography,
  FullCard,
  MenuItem,
} from '@rosen-bridge/ui-kit';
import { mutator } from '@rosen-ui/swr-helpers';

import { ApiSignRequestBody, ApiSignResponse } from '@/_types/api';

interface Form {
  chain: string;
  txJson: string;
}
/**
 * render a form for signing a tx
 */
const SendForSigningForm = () => {
  const { trigger, isMutating: isSignPending } = useSWRMutation<
    ApiSignResponse,
    any,
    '/sign',
    ApiSignRequestBody
  >('/sign', mutator);

  const [alertData, setAlertData] = useState<{
    severity: AlertProps['severity'];
    message: string;
  } | null>(null);

  const { handleSubmit, register, reset } = useForm({
    defaultValues: {
      txJson: '',
      chain: '',
    },
  });

  const onSubmit: SubmitHandler<Form> = async (data) => {
    try {
      const { txJson, chain } = data;
      const response = await trigger({ txJson, chain });

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
        message: error.message,
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
        />

        <SubmitButton loading={isSignPending}>Send</SubmitButton>
      </form>
    </FullCard>
  );
};

export default SendForSigningForm;
