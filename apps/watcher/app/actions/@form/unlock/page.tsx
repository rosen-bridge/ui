'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import {
  AlertCard,
  AlertProps,
  Box,
  Grid,
  SubmitButton,
} from '@rosen-bridge/ui-kit';
import { fetcher, mutator } from '@rosen-ui/swr-helpers';
import { TokenInfo } from '@rosen-ui/types';
import { getNonDecimalString } from '@rosen-ui/utils';

import TokenAmountTextField, {
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

import useRsnToken from '@/_hooks/useRsnToken';

import {
  ApiInfoResponse,
  ApiPermitRequestBody,
  ApiPermitResponse,
} from '@/_types/api';

const UnlockForm = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();

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

  const [alertData, setAlertData] = useState<{
    severity: AlertProps['severity'];
    message: string;
  } | null>(null);

  const { trigger, isMutating: isUnlockPending } = useSWRMutation<
    ApiPermitResponse,
    any,
    '/permit/return',
    ApiPermitRequestBody
  >('/permit/return', mutator);

  const formMethods = useForm({
    defaultValues: {
      amount: '',
    },
  });
  const { handleSubmit } = formMethods;

  const noRwtToken = !!rwtPartialToken && !rwtPartialToken.amount;

  useEffect(() => {
    if (noRwtToken) {
      setAlertData({
        severity: 'error',
        message: 'no Permit',
      });
    } else {
      setAlertData(null);
    }
  }, [noRwtToken]);

  const onSubmit: SubmitHandler<TokenAmountCompatibleFormSchema> = async (
    data,
  ) => {
    try {
      const count = getNonDecimalString(data.amount, rsnToken?.decimals ?? 0);
      const response = await trigger({ count });

      if (response?.txId) {
        setAlertData({
          severity: 'success',
          message: `Unlock operation is in progress. ${count} RWT${
            count === '1' ? '' : 's'
          } will be redeemed after tx [${response.txId}] is confirmed.`,
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

  const disabled = isInfoLoading || isRsnTokenLoading || noRwtToken;

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

        <SubmitButton loading={isUnlockPending} disabled={disabled}>
          Unlock
        </SubmitButton>
      </form>
    </FormProvider>
  );
};

export default UnlockForm;
