'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import {
  AlertCard,
  AlertProps,
  Box,
  Grid,
  useApiKey,
  ApiKeyModalWarning,
  Button2,
} from '@rosen-bridge/ui-kit';
import { fetcher, mutatorWithHeaders } from '@rosen-ui/swr-helpers';
import { TokenInfo } from '@rosen-ui/types';
import { getNonDecimalString } from '@rosen-ui/utils';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { useRsnToken } from '@/_hooks/useRsnToken';
import {
  ApiInfoResponse,
  ApiPermitReturnRequestBody,
  ApiPermitReturnResponse,
} from '@/_types/api';

import { ConfirmationModal } from '../../ConfirmationModal';
import {
  TokenAmountTextField,
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

const UnlockForm = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();
  const { apiKey } = useApiKey();

  const rwtPartialToken = useMemo<
    Pick<TokenInfo, 'amount' | 'decimals'> | undefined
  >(
    () =>
      info?.permitCount.active
        ? {
            amount: info.permitCount.active,
            decimals: rsnToken?.decimals ?? 0,
            name: rsnToken?.name,
          }
        : undefined,
    [info, rsnToken],
  );

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const [alertData, setAlertData] = useState<{
    severity: AlertProps['severity'];
    message: string;
  } | null>(null);

  const { trigger, isMutating: isUnlockPending } = useSWRMutation<
    ApiPermitReturnResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    '/permit/return',
    ApiPermitReturnRequestBody
  >('/permit/return', mutatorWithHeaders);

  const formMethods = useForm({
    defaultValues: {
      amount: '',
    },
  });
  const { handleSubmit, watch } = formMethods;

  const formData = watch();

  useEffect(() => {
    if (
      info?.permitCount.active !== info?.permitCount.total &&
      rwtPartialToken &&
      getNonDecimalString(formData.amount, rwtPartialToken?.decimals) ===
        info?.permitCount.active.toString()
    ) {
      setAlertData({
        severity: 'warning',
        message:
          'Currently you have inactive permits, we recommend not unlocking all your permits to prevent future malfunctioning.',
      });
    } else {
      setAlertData(null);
    }
  }, [
    formData.amount,
    info?.permitCount.active,
    info?.permitCount.total,
    rwtPartialToken,
  ]);

  useEffect(() => {
    if (!isInfoLoading && !rwtPartialToken?.amount) {
      setAlertData({
        severity: 'error',
        message: "You don't have any locked RSN.",
      });
    } else {
      setAlertData(null);
    }
  }, [isInfoLoading, rwtPartialToken?.amount]);

  const submit = async () => {
    try {
      const count = getNonDecimalString(
        formData.amount,
        rsnToken?.decimals ?? 0,
      );
      const response = await trigger({
        data: { count },
        headers: {
          'Api-Key': apiKey!,
        },
      });

      if (response?.txId) {
        setAlertData({
          severity: 'success',
          message: `Unlock operation is in progress. Wait for tx ${response.txId} to be confirmed by some blocks.`,
        });
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
          message: error.message,
        });
      }
    }
  };

  const onSubmit: SubmitHandler<TokenAmountCompatibleFormSchema> = async () => {
    setConfirmationModalOpen(true);
  };

  const renderAlert = () => (
    <AlertCard
      severity={alertData?.severity}
      onClose={() => setAlertData(null)}
    >
      {alertData?.message}
    </AlertCard>
  );

  const disabled =
    !apiKey || isInfoLoading || isRsnTokenLoading || !rwtPartialToken?.amount;

  const renderTokenAmountTextField = () => (
    <TokenAmountTextField
      disabled={disabled}
      loading={isInfoLoading || isRsnTokenLoading}
      token={rwtPartialToken}
    />
  );

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mt={2} />
        {renderAlert()}
        <Grid item mobile={12} laptop={12}>
          {renderTokenAmountTextField()}
        </Grid>

        <ApiKeyModalWarning />

        <Button2 loading={isUnlockPending} disabled={disabled}>
          Unlock
        </Button2>

        <ConfirmationModal
          open={confirmationModalOpen}
          title="Confirm Unlock"
          /**
           * TODO: The content should show the amounts of collateral and
           * unlocked RSN
           * local:ergo/rosen-bridge/ui#104
           */
          content={`You are going to unlock ${formData.amount} ${
            rsnToken?.name ?? 'token'
          }.`}
          buttonText="Unlock"
          handleClose={() => setConfirmationModalOpen(false)}
          onConfirm={submit}
        />
      </form>
    </FormProvider>
  );
};

export default UnlockForm;
