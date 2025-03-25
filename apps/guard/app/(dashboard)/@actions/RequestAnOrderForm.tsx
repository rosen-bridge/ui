import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import {
  AlertCard,
  AlertProps,
  ApiKeyModalWarning,
  FullCard,
  Grid,
  MenuItem,
  SubmitButton,
  TextField,
  Typography,
  useApiKey,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import { mutatorWithHeaders } from '@rosen-ui/swr-helpers';
import { Network } from '@rosen-ui/types';
import useSWRMutation from 'swr/mutation';

import { ApiOrderRequestBody, ApiOrderResponse } from '@/_types/api';

interface Form {
  id: string;
  chain: Network;
  orderJson: string;
}

export const RequestAnOrderForm = () => {
  const { apiKey } = useApiKey();

  const {
    trigger,
    isMutating: isOrderPending,
    error,
  } = useSWRMutation<ApiOrderResponse, any, '/order', ApiOrderRequestBody>(
    '/order',
    mutatorWithHeaders,
  );

  const [alertData, setAlertData] = useState<{
    severity: AlertProps['severity'];
    message: string;
  } | null>(null);

  const { handleSubmit, register, reset } = useForm({
    defaultValues: {
      id: '',
      chain: '' as Network,
      orderJson: '',
    },
  });

  const onSubmit: SubmitHandler<Form> = async (data) => {
    if (!apiKey) return;

    try {
      const response = await trigger({
        data,
        headers: {
          'Api-Key': apiKey,
        },
      });

      if (response.message === 'Ok') {
        setAlertData({
          severity: 'success',
          message: `The order is received successfully.`,
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
              ? `An order is already exist with id [${data.id}].`
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
    <FullCard title="Request An Order" backgroundColor="transparent">
      <form onSubmit={handleSubmit(onSubmit)}>
        {renderAlert()}

        <TextField label="Id" {...register('id')} sx={{ mb: 2 }} />
        <TextField
          select
          label="Chain"
          {...register('chain')}
          sx={{ mb: 2 }}
          fullWidth
        >
          {NETWORKS_KEYS.map((key) => (
            <MenuItem key={key} value={key}>
              {NETWORKS[key].label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Order"
          multiline
          rows={5}
          {...register('orderJson')}
          sx={{ mb: 2 }}
        />

        {error?.response?.status === 403 && (
          <Grid
            container
            alignItems="center"
            sx={(theme) => ({ color: theme.palette.warning.main })}
          >
            <Typography>The Api key is not correct</Typography>
          </Grid>
        )}

        <ApiKeyModalWarning />

        <SubmitButton loading={isOrderPending} disabled={!apiKey}>
          Send
        </SubmitButton>
      </form>
    </FullCard>
  );
};
