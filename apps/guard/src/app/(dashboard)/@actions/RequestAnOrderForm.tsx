import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import {
  AlertCard,
  AlertProps,
  ApiKeyModalWarning,
  Grid,
  Card,
  MenuItem,
  SubmitButton,
  TextField,
  Typography,
  useApiKey,
  CardHeader,
  CardTitle,
  CardBody,
  Stack,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import { mutatorWithHeaders } from '@rosen-ui/swr-helpers';
import { Network } from '@rosen-ui/types';
import useSWRMutation from 'swr/mutation';

import { ApiOrderRequestBody, ApiOrderResponse } from '@/types/api';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <Card backgroundColor="transparent">
      <CardHeader>
        <CardTitle>
          <Typography variant="h5" fontWeight="bold">
            Request An Order
          </Typography>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderAlert()}
          <Stack spacing={2}>
            <TextField label="Id" {...register('id')} />
            <TextField select label="Chain" {...register('chain')} fullWidth>
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
            />

            {error?.response?.status === 403 && (
              <Grid container alignItems="center">
                <Typography color="warning.main">
                  The Api key is not correct
                </Typography>
              </Grid>
            )}

            <ApiKeyModalWarning />

            <SubmitButton loading={isOrderPending} disabled={!apiKey}>
              Send
            </SubmitButton>
          </Stack>
        </form>
      </CardBody>
    </Card>
  );
};
