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
} from '@rosen-bridge/ui-kit';
import { mutator } from '@rosen-ui/swr-helpers';

import { ApiSignRequestBody, ApiSignResponse } from '@/_types/api';

interface Form {
  tx: string;
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

  const { handleSubmit, register } = useForm({
    defaultValues: {
      tx: '',
    },
  });

  const onSubmit: SubmitHandler<Form> = async (data) => {
    try {
      const { tx } = data;
      const response = await trigger({ tx });

      if (response === 'OK') {
        setAlertData({
          severity: 'success',
          message: `Sign operation successful.`,
        });
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

        <Typography sx={{ mb: 2 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </Typography>

        <TextField label="Transaction" multiline rows={5} {...register('tx')} />

        <SubmitButton loading={isSignPending}>Send</SubmitButton>
      </form>
    </FullCard>
  );
};

export default SendForSigningForm;
