'use client';

import { useEffect, useMemo } from 'react';
import { FormProvider, type SubmitHandler, useForm } from 'react-hook-form';

import {
  Alert,
  ApiKeyDialogProtectedAction,
  ApiKeyDialogWarning,
  Link,
  Stack,
  SubmitButton,
  Typography,
  useApiKey,
  useConfirm,
  useToast,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher, mutatorWithHeaders } from '@rosen-ui/swr-helpers';
import {
  getDecimalString,
  getNonDecimalString,
  getTxURL,
} from '@rosen-ui/utils';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { useRsnToken, useToken } from '@/hooks';
import type {
  ApiInfoResponse,
  ApiPermitRequestBody,
  ApiPermitResponse,
} from '@/types/api';

import {
  type TokenAmountCompatibleFormSchema,
  TokenAmountTextField,
} from '../../TokenAmountTextField';

const LockForm = () => {
  const { confirm } = useConfirm();
  const toast = useToast();

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();
  const { token: ergToken, isLoading: isErgTokenLoading } = useToken('erg');
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );
  const { apiKey } = useApiKey();

  const modifiedRsnTokenConsideringCollateral = useMemo(
    () =>
      rsnToken && {
        ...rsnToken,
        amount:
          info && !info.permitCount.total
            ? Math.max(rsnToken.amount - info.collateral.rsn - 1, 0)
            : rsnToken.amount,
      },
    [info, rsnToken],
  );

  const {
    trigger,
    isMutating: isLockPending,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useSWRMutation<ApiPermitResponse, any, '/permit', ApiPermitRequestBody>(
    '/permit',
    mutatorWithHeaders,
  );

  useEffect(() => {
    if (!isRsnTokenLoading && !rsnToken?.amount) {
      toast.add({
        type: 'error',
        dismissible: true,
        description: "You don't have any RSN.",
        timeout: 0,
      });
    }
  }, [isRsnTokenLoading, rsnToken, toast.add]);

  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: {
      amount: '',
    },
  });
  const { handleSubmit, watch, formState } = formMethods;

  const formData = watch();
  const submit = async () => {
    try {
      const count = getNonDecimalString(formData.amount, rsnToken!.decimals);

      const response = await trigger({
        data: {
          count: (+count + (info?.permitCount.total ? 0 : 1)).toString(),
        },
        headers: {
          'Api-Key': apiKey!,
        },
      });

      if (response?.txId) {
        toast.add({
          type: 'success',
          description: (
            <>
              Lock operation is in progress. Wait for tx [
              <Link
                target="_blank"
                href={getTxURL(NETWORKS.ergo.key, response.txId)}
              >
                {response.txId}
              </Link>
              ] to be confirmed by some blocks, so your new permits will be
              activated.
            </>
          ),
        });
      } else {
        throw new Error(
          'Server responded but the response message was unexpected',
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.add({
          type: 'error',
          description: 'The Api key is not correct',
        });
      } else {
        toast.add({
          type: 'error',
          description: error.message,
          dismissible: true,
          timeout: 0,
          more: () => JSON.stringify(error.response?.data, null, 2),
        });
      }
    }
  };

  const onSubmit: SubmitHandler<TokenAmountCompatibleFormSchema> = async () => {
    await confirm({
      title: 'Confirm Lock',
      /**
       * TODO: The content should show the amounts of collateral and
       * received permits
       * local:ergo/rosen-bridge/ui#104
       */
      content: `You are going to lock ${formData.amount} ${rsnToken?.name ?? 'token'}. You will get some reporting permits in return.`,
      confirmText: 'Lock',
      onConfirm: submit,
    });
  };

  const disabled =
    isRsnTokenLoading ||
    isInfoLoading ||
    isErgTokenLoading ||
    !rsnToken?.amount;

  const renderTokenAmountTextField = () => (
    <TokenAmountTextField
      disabled={disabled}
      loading={isRsnTokenLoading}
      token={modifiedRsnTokenConsideringCollateral}
      setMinValue
    />
  );

  const renderCollateralAlert = () =>
    !info?.permitCount.total &&
    !isRsnTokenLoading && (
      <Alert severity="info" variant="filled">
        <Typography>
          An additional{' '}
          {getDecimalString(
            ((info?.collateral.rsn ?? 0) + 1).toString(),
            rsnToken?.decimals ?? 0,
          )}{' '}
          RSN and{' '}
          {getDecimalString(
            (info?.collateral.erg ?? 0).toString(),
            ergToken?.decimals ?? 0,
          )}{' '}
          ERG is required to put your collateral. (You need more ERG to pay for
          transaction fees.)
        </Typography>
      </Alert>
    );

  const renderReportsCountAlert = () => {
    if (
      !formData.amount ||
      !info?.collateral.rsn ||
      !rsnToken?.decimals ||
      !rsnToken.amount
    )
      return null;

    const nonDecimalAmount = +getNonDecimalString(
      formData.amount,
      rsnToken?.decimals,
    );

    const reportsCount = Math.floor(+nonDecimalAmount / info?.permitsPerEvent);

    const nonDecimalRemainder = +nonDecimalAmount % info?.permitsPerEvent;
    const remainder = +getDecimalString(
      nonDecimalRemainder.toString(),
      rsnToken.decimals,
    );

    if (reportsCount) {
      if (remainder) {
        return (
          <Alert severity="info" variant="filled">
            <Typography>
              Currently, by locking {formData.amount} RSN, you can report{' '}
              {reportsCount} events using {+formData.amount - remainder} RSN and{' '}
              {remainder} RSN will be reserved until you lock more.
            </Typography>
          </Alert>
        );
      }
      return (
        <Alert severity="info" variant="filled">
          <Typography>
            Currently, by locking {formData.amount} RSN, you can report{' '}
            {reportsCount} events.
          </Typography>
        </Alert>
      );
    }
    return (
      <Alert severity="info" variant="filled">
        <Typography>
          Currently, by locking {remainder} RSN, you cannot report any
          additional event unless you already have at least{' '}
          {getDecimalString(
            (info?.permitsPerEvent - nonDecimalRemainder).toString(),
            rsnToken.decimals,
          )}{' '}
          locked RSN. You can top it up later.
        </Typography>
      </Alert>
    );
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <ApiKeyDialogWarning />
          {renderTokenAmountTextField()}
          {renderCollateralAlert()}
          {renderReportsCountAlert()}
          <ApiKeyDialogProtectedAction>
            <SubmitButton
              loading={isLockPending}
              disabled={!formState.isValid || disabled}
            >
              Lock
            </SubmitButton>
          </ApiKeyDialogProtectedAction>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default LockForm;
