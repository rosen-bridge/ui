'use client';

import React, { useMemo, useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { AlertProps, Box, Grid } from '@rosen-bridge/ui-kit';

import AlertCard from '../../AlertCard';
import SubmitButton from '../../SubmitButton';
import TokenAmountTextField from '../../TokenAmountTextField';

import { getNonDecimalString } from '@/_utils/decimals';
import fetcher from '@/_utils/fetcher';
import mutator from '@/_utils/mutator';

import {
  ApiAddressAssetsResponse,
  ApiInfoResponse,
  ApiPermitRequestBody,
  ApiPermitResponse,
} from '@/_types/api';

interface Form {
  amount: string;
}

const LockForm = () => {
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher
  );
  const { data: tokens, isLoading: isTokensListLoading } =
    useSWR<ApiAddressAssetsResponse>('/address/assets', fetcher);

  const rsnToken = useMemo(() => {
    if (info && tokens) {
      return tokens.find((token) => token.tokenId === info.rsnTokenId);
    }
  }, [tokens, info]);

  const [alertData, setAlertData] = useState<{
    severity: AlertProps['severity'];
    message: string;
  } | null>(null);

  const { trigger, isMutating: isLockPending } = useSWRMutation<
    ApiPermitResponse,
    any,
    '/permit',
    ApiPermitRequestBody
  >('/permit', mutator);

  const formMethods = useForm({
    defaultValues: {
      amount: '',
    },
  });
  const { handleSubmit } = formMethods;

  const onSubmit: SubmitHandler<Form> = async (data) => {
    try {
      const count = getNonDecimalString(data.amount, rsnToken!.decimals);

      const response = await trigger({ count });

      if (response?.txId) {
        setAlertData({
          severity: 'success',
          message: `Lock operation is in progress. ${count} RWT${
            count === '1' ? '' : 's'
          } will be reserved for you after tx [${response.txId}] is confirmed.`,
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
      disabled={isTokensListLoading || isInfoLoading}
      loading={isTokensListLoading || isInfoLoading}
      token={rsnToken}
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

        <SubmitButton loading={isLockPending}>Lock</SubmitButton>
      </form>
    </FormProvider>
  );
};

export default LockForm;
