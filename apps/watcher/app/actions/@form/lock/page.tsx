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
  Typography,
} from '@rosen-bridge/ui-kit';
import { mutator, fetcher } from '@rosen-ui/swr-helpers';
import { getNonDecimalString, getDecimalString } from '@rosen-ui/utils';

import ConfirmationModal from '../../ConfirmationModal';
import TokenAmountTextField, {
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

import useRsnToken from '@/_hooks/useRsnToken';
import useToken from '@/_hooks/useToken';

import {
  ApiPermitRequestBody,
  ApiPermitResponse,
  ApiInfoResponse,
} from '@/_types/api';

const LockForm = () => {
  const { rsnToken, isLoading: isRsnTokenLoading } = useRsnToken();
  const { token: ergToken, isLoading: isErgTokenLoading } = useToken('erg');
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
            ? Math.max(rsnToken.amount - info.collateral.rsn - 1, 0)
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
        message: "You don't have any RSN.",
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

      const response = await trigger({
        count: (+count + (info?.permitCount.total ? 0 : 1)).toString(),
      });

      if (response?.txId) {
        setAlertData({
          severity: 'success',
          message: `Lock operation is in progress. Wait for tx [${response.txId}] to be confirmed by some blocks, so your new permits will be activated.`,
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
    />
  );

  const renderCollateralAlert = () =>
    !info?.permitCount.total &&
    !isRsnTokenLoading && (
      <AlertCard severity="info">
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
      </AlertCard>
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
      rsnToken!.decimals,
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
          <AlertCard severity="info">
            <Typography>
              Currently, by locking {formData.amount} RSN, you can report{' '}
              {reportsCount} events using {+formData.amount - remainder} RSN and{' '}
              {remainder} RSN will be reserved until you lock more.
            </Typography>
          </AlertCard>
        );
      }
      return (
        <AlertCard severity="info">
          <Typography>
            Currently, by locking {formData.amount} RSN, you can report{' '}
            {reportsCount} events.
          </Typography>
        </AlertCard>
      );
    }
    return (
      <AlertCard severity="info">
        <Typography>
          Currently, by locking {remainder} RSN, you cannot report any
          additional event unless you already have at least{' '}
          {getDecimalString(
            (info?.permitsPerEvent - nonDecimalRemainder).toString(),
            rsnToken.decimals,
          )}{' '}
          locked RSN. You can top it up later.
        </Typography>
      </AlertCard>
    );
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mt={2} />
        {renderAlert()}
        <Grid item mobile={12} laptop={12}>
          {renderTokenAmountTextField()}
        </Grid>

        <Grid mt={2}>
          {renderCollateralAlert()}
          {renderReportsCountAlert()}
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
