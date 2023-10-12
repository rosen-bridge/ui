'use client';

import React, { useState, useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import useSWRMutation from 'swr/mutation';

import {
  AlertCard,
  AlertProps,
  Box,
  Grid,
  SubmitButton,
} from '@rosen-bridge/ui-kit';
import { mutator } from '@rosen-ui/swr-helpers';
import { getNonDecimalString } from '@rosen-ui/utils';

import TokenAmountTextField, {
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

import useRsnToken from '@/_hooks/useRsnToken';

import { ApiPermitRequestBody, ApiPermitResponse } from '@/_types/api';

const LockForm = () => {
  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();

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

  useEffect(() => {
    if (!isRsnTokenLoading && !rsnToken?.amount) {
      setAlertData({
        severity: 'error',
        message: 'RSN token does not exist',
      });
    }
  }, [isRsnTokenLoading, rsnToken]);

  const formMethods = useForm({
    defaultValues: {
      amount: '',
    },
  });
  const { handleSubmit } = formMethods;

  const onSubmit: SubmitHandler<TokenAmountCompatibleFormSchema> = async (
    data,
  ) => {
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

  const disabled = isRsnTokenLoading || !rsnToken?.amount;

  const renderTokenAmountTextField = () => (
    <TokenAmountTextField
      disabled={disabled}
      loading={isRsnTokenLoading}
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

        <SubmitButton loading={isLockPending} disabled={disabled}>
          {' '}
          Lock
        </SubmitButton>
      </form>
    </FormProvider>
  );
};

export default LockForm;
