import { useState } from 'react';

import { type SubmitHandler, useForm } from 'react-hook-form';
import useSWRMutation from 'swr/mutation';

import {
  Alert,
  type AlertProps,
  ApiKeyDialogWarning,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  MenuItemMui,
  Stack,
  SubmitButton,
  TextField,
  useApiKey,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import { mutatorWithHeaders } from '@rosen-ui/swr-helpers';
import type { Network } from '@rosen-ui/types';

import type { ApiOrderRequestBody, ApiOrderResponse } from '@/types/api';

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
    // biome-ignore lint/suspicious/noExplicitAny: Use a better type
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
      // biome-ignore lint/suspicious/noExplicitAny: Use a better type
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
    <Alert
      dismissible
      open={!!alertData?.severity}
      severity={alertData?.severity}
      variant="filled"
      onClose={() => setAlertData(null)}
    >
      {alertData?.message}
    </Alert>
  );

  return (
    <Card backgroundColor="transparent">
      <CardHeader>
        <CardTitle variant="h5" fontWeight="bold">
          Request An Order
        </CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            {renderAlert()}

            <ApiKeyDialogWarning />

            <TextField label="Id" {...register('id')} />

            <TextField select label="Chain" {...register('chain')} fullWidth>
              {NETWORKS_KEYS.map((key) => (
                <MenuItemMui key={key} value={key}>
                  {NETWORKS[key].label}
                </MenuItemMui>
              ))}
            </TextField>

            <TextField
              label="Order"
              multiline
              rows={5}
              {...register('orderJson')}
            />

            <SubmitButton loading={isOrderPending} disabled={!apiKey}>
              Send
            </SubmitButton>
          </Stack>
        </form>
      </CardBody>
    </Card>
  );
};
