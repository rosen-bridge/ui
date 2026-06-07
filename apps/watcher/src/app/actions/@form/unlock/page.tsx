'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import {
  SubmitButton,
  useApiKey,
  ApiKeyDialogWarning,
  Stack,
  useToast,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher, mutatorWithHeaders } from '@rosen-ui/swr-helpers';
import { TokenInfo } from '@rosen-ui/types';
import { getNonDecimalString, getTxURL } from '@rosen-ui/utils';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { CopyDetails } from '@/components';
import { useRsnToken } from '@/hooks';
import {
  ApiInfoResponse,
  ApiPermitReturnRequestBody,
  ApiPermitReturnResponse,
} from '@/types/api';

import { ConfirmationModal } from '../../ConfirmationModal';
import {
  TokenAmountTextField,
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

const UnlockForm = () => {
  const toast = useToast();

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

  const { trigger, isMutating: isUnlockPending } = useSWRMutation<
    ApiPermitReturnResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    '/permit/return',
    ApiPermitReturnRequestBody
  >('/permit/return', mutatorWithHeaders);

  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: {
      amount: '',
    },
  });
  const { handleSubmit, watch, formState } = formMethods;

  const formData = watch();

  useEffect(() => {
    if (
      info?.permitCount.active !== info?.permitCount.total &&
      rwtPartialToken &&
      getNonDecimalString(formData.amount, rwtPartialToken?.decimals) ===
        info?.permitCount.active.toString()
    ) {
      toast.add({
        type: 'warning',
        dismissible: true,
        description:
          'Currently you have inactive permits, we recommend not unlocking all your permits to prevent future malfunctioning.',
        timeout: 0,
      });
    }
  }, [
    formData.amount,
    info?.permitCount.active,
    info?.permitCount.total,
    rwtPartialToken,
  ]);

  useEffect(() => {
    if (!isInfoLoading && !rwtPartialToken?.amount) {
      toast.add({
        type: 'error',
        dismissible: true,
        description: "You don't have any locked RSN.",
        timeout: 0,
      });
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
        toast.add({
          type: 'success',
          description: (
            <>
              Unlock operation is in progress. Wait for tx [
              <Link
                target="_blank"
                href={getTxURL(NETWORKS.ergo.key, response.txId) ?? '/'}
              >
                {response.txId}
              </Link>
              ] to be confirmed by some blocks.
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
    setConfirmationModalOpen(true);
  };

  const disabled =
    isInfoLoading || isRsnTokenLoading || !rwtPartialToken?.amount;

  const renderTokenAmountTextField = () => (
    <TokenAmountTextField
      disabled={disabled}
      loading={isInfoLoading || isRsnTokenLoading}
      token={rwtPartialToken}
      setMinValue
    />
  );

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <ApiKeyDialogWarning />
          {renderTokenAmountTextField()}
          <SubmitButton
            loading={isUnlockPending}
            disabled={!formState.isValid || !apiKey || disabled}
          >
            Unlock
          </SubmitButton>
        </Stack>
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
