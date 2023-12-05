'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { mutator, fetcher } from '@rosen-ui/swr-helpers';
import { getNonDecimalString } from '@rosen-ui/utils';

import ConfirmationModal from '../../ConfirmationModal';
import TokenAmountTextField, {
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

import useRsnToken from '@/_hooks/useRsnToken';

import {
  ApiPermitRequestBody,
  ApiPermitResponse,
  ApiInfoResponse,
} from '@/_types/api';

const LockForm = () => {
  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();
  const { data: info, isLoading: isInfoLoading } = useSWR<ApiInfoResponse>(
    '/info',
    fetcher,
  );

  const modifiedRsnTokenConsideringCollateral = useMemo(
    () =>
      rsnToken && {
        ...rsnToken,
        amount:
          info && !info.permitCount.total
            ? Math.max(rsnToken.amount - info.collateral.rsn, 0)
            : rsnToken.amount,
      },
    [info, rsnToken],
  );

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

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
  const { handleSubmit, watch } = formMethods;

  const formData = watch();
  const submit = async () => {
    try {
      const count = getNonDecimalString(formData.amount, rsnToken!.decimals);

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

  const disabled = isRsnTokenLoading || isInfoLoading || !rsnToken?.amount;

  const renderTokenAmountTextField = () => (
    <TokenAmountTextField
      disabled={disabled}
      loading={isRsnTokenLoading}
      token={modifiedRsnTokenConsideringCollateral}
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

        <ConfirmationModal
          open={confirmationModalOpen}
          title="Confirm Lock"
          /**
           * TODO: The content should show the amounts of collateral and
           * received permits
           * local:ergo/rosen-bridge/ui#104
           */
          content={`You are going to lock ${formData.amount} ${
            rsnToken?.name ?? 'token'
          }. You will get some reporting permits in return.`}
          buttonText="Lock"
          handleClose={() => setConfirmationModalOpen(false)}
          onConfirm={submit}
        />
      </form>
    </FormProvider>
  );
};

export default LockForm;
