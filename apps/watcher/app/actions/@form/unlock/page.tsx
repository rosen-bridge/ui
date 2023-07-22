'use client';

import React, { useMemo, useState } from 'react';
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

import TokenAmountTextField, {
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

import {
  ApiInfoResponse,
  ApiPermitRequestBody,
  ApiPermitResponse,
} from '@/_types/api';

const UnlockForm = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher
  );

  const rwtPartialToken = useMemo<
    Pick<TokenInfo, 'amount' | 'decimals'> | undefined
  >(
    () =>
      info?.permitCount
        ? {
            amount: info.permitCount.total,
            decimals: 0,
          }
        : undefined,
    [info?.permitCount]
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

  const onSubmit: SubmitHandler<TokenAmountCompatibleFormSchema> = async (
    data
  ) => {
    try {
      const count = data.amount;
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
          'Server responded but the response message was unexpected'
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

  const renderTokenAmountTextField = () => (
    <TokenAmountTextField
      disabled={isInfoLoading}
      loading={isInfoLoading}
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

        <SubmitButton loading={isUnlockPending}>Unlock</SubmitButton>
      </form>
    </FormProvider>
  );
};

export default UnlockForm;
