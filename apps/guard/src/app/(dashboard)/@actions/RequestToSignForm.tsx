import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import {
  Alert,
  AlertProps,
  ApiKeyDialogWarning,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  MenuItemMui,
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
          Request To Sign
        </CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            {renderAlert()}

            <ApiKeyDialogWarning />

            <TextField
              select
              label="Chain"
              {...register('chain')}
              value={watch('chain') || ''}
              fullWidth
            >
              {NETWORKS_KEYS.map((key) => (
                <MenuItemMui key={key} id={key}>
                  {NETWORKS[key].label}
                </MenuItemMui>
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

            <SubmitButton loading={isSignPending} disabled={!apiKey}>
              Send
            </SubmitButton>
          </Stack>
        </form>
      </CardBody>
    </Card>
  );
};
