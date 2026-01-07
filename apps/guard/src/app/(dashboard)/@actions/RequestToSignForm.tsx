import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import {
  AlertCard,
  AlertProps,
  ApiKeyModalWarning,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  MenuItem,
  Stack,
  SubmitButton,
  TextField,
  Typography,
  useApiKey,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, NETWORKS_KEYS } from '@rosen-ui/constants';
import { mutatorWithHeaders } from '@rosen-ui/swr-helpers';
import { Network } from '@rosen-ui/types';
import useSWRMutation from 'swr/mutation';

import { ApiSignRequestBody, ApiSignResponse } from '@/types/api';

interface Form {
  chain: Network;
  txJson: string;
  requiredSign: number;
  overwrite?: boolean;
}

/**
 * render a form for signing a tx
 */
export const RequestToSignForm = () => {
  const { apiKey } = useApiKey();

  const {
    trigger,
    isMutating: isSignPending,
    error,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useSWRMutation<ApiSignResponse, any, '/sign', ApiSignRequestBody>(
    '/sign',
    mutatorWithHeaders,
  );

  const [alertData, setAlertData] = useState<{
    severity: AlertProps['severity'];
    message: string;
  } | null>(null);

  const { handleSubmit, register, reset, watch } = useForm({
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
          message: `The transaction is received succssefully.`,
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
              ? 'Tx is already sent for signing. If you want to overwrite, click the checkbox and submit again.'
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
    <Card backgroundColor="background.paper">
      <CardHeader>
        <CardTitle>
          <Typography variant="h5" fontWeight="bold">
            Request To Sign
          </Typography>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          {renderAlert()}
          <Stack spacing={2}>
            <TextField
              select
              label="Chain"
              {...register('chain')}
              value={watch('chain') || ''}
              fullWidth
            >
              {NETWORKS_KEYS.map((key) => (
                <MenuItem key={key} value={key}>
                  {NETWORKS[key].label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Transaction"
              multiline
              rows={5}
              {...register('txJson')}
            />
            <TextField label="Required Signs" {...register('requiredSign')} />

            {error?.response?.status === 409 && (
              <Stack direction="row" align="center">
                <Checkbox {...register('overwrite')} />
                <Typography>Overwrite the already sent transaction</Typography>
              </Stack>
            )}

            {error?.response?.status === 403 && (
              <Typography color="warning.main">
                The Api key is not correct
              </Typography>
            )}

            <ApiKeyModalWarning />

            <SubmitButton loading={isSignPending} disabled={!apiKey}>
              Send
            </SubmitButton>
          </Stack>
        </form>
      </CardBody>
    </Card>
  );
};
