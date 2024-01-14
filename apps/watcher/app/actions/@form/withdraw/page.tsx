'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  FormProvider,
  SubmitHandler,
  useController,
  useForm,
} from 'react-hook-form';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import {
  AlertCard,
  AlertProps,
  Box,
  CircularProgress,
  Grid,
  Id,
  InputAdornment,
  MenuItem,
  SubmitButton,
  TextField,
} from '@rosen-bridge/ui-kit';
import { TOKEN_NAME_PLACEHOLDER } from '@rosen-ui/constants';
import { fetcher, mutator } from '@rosen-ui/swr-helpers';
import { getNonDecimalString } from '@rosen-ui/utils';

import ConfirmationModal from '../../ConfirmationModal';
import TokenAmountTextField, {
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

import useToken from '@/_hooks/useToken';

import {
  ApiAddressAssetsResponse,
  ApiWithdrawRequestBody,
  ApiWithdrawResponse,
} from '@/_types/api';

interface Form extends TokenAmountCompatibleFormSchema {
  address: string;
  tokenId: string;
}

const WithdrawForm = () => {
  const { data, isLoading: isTokensListLoading } =
    useSWR<ApiAddressAssetsResponse>('/address/assets', fetcher, {});

  const { token: ergToken, isLoading: isErgTokenLoading } = useToken('erg');

  const tokens = useMemo(
    () => data?.items.filter((token) => !!token.amount),
    [data],
  );

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const [alertData, setAlertData] = useState<{
    severity: AlertProps['severity'];
    message: string;
  } | null>(null);

  const { trigger, isMutating: isWithdrawPending } = useSWRMutation<
    ApiWithdrawResponse,
    any,
    '/withdraw',
    ApiWithdrawRequestBody
  >('/withdraw', mutator);

  useEffect(() => {
    if (!isErgTokenLoading && !ergToken?.amount) {
      setAlertData({
        severity: 'error',
        message: 'Your wallet is empty. There is nothing to withdraw.',
      });
    }
  }, [isErgTokenLoading, ergToken]);

  const formMethods = useForm({
    defaultValues: {
      address: '',
      tokenId: tokens?.[0]?.tokenId ?? '',
      amount: '',
    },
  });
  const { handleSubmit, control, resetField, register, watch } = formMethods;

  const formData = watch();

  const { field: tokenIdField } = useController({
    control,
    name: 'tokenId',
  });

  const selectedToken = useMemo(
    () => tokens?.find((token) => token.tokenId === tokenIdField.value),
    [tokens, tokenIdField.value],
  );

  useEffect(() => {
    if (tokens && !tokenIdField.value) {
      resetField('tokenId', { defaultValue: tokens?.[0]?.tokenId ?? '' });
    }
  }, [tokens, resetField, tokenIdField.value]);

  const submit = async () => {
    try {
      const response = await trigger({
        address: formData.address,
        tokens: [
          {
            tokenId: formData.tokenId,
            amount: BigInt(
              getNonDecimalString(formData.amount, selectedToken!.decimals),
            ),
          },
        ],
      });
      if (response.status === 'OK') {
        setAlertData({
          severity: 'success',
          message: `Withdrawal is successful. Wait for tx [${response.txId}] to be confirmed.`,
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

  const onSubmit: SubmitHandler<Form> = () => {
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
    isTokensListLoading || isErgTokenLoading || !ergToken?.amount;

  const renderAddressTextField = () => (
    <TextField
      autoFocus
      label="Address"
      disabled={disabled}
      {...register('address', { required: true })}
    />
  );

  const renderTokensListSelect = () => (
    <TextField
      label="Token"
      select={!isTokensListLoading}
      InputProps={{
        startAdornment: isTokensListLoading && (
          <InputAdornment position="start">
            <CircularProgress size={18} color="inherit" />
          </InputAdornment>
        ),
      }}
      {...tokenIdField}
      disabled={disabled}
    >
      {tokens?.map((token) => (
        <MenuItem value={token.tokenId} key={token.tokenId}>
          {token.name ?? TOKEN_NAME_PLACEHOLDER}
          &nbsp;
          {!token.isNativeToken && (
            <>
              (<Id id={token.tokenId} />)
            </>
          )}
        </MenuItem>
      ))}
    </TextField>
  );

  const renderTokenAmountTextField = () => (
    <TokenAmountTextField disabled={disabled} token={selectedToken} />
  );

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box mt={2} />
        {renderAlert()}

        <Grid container item mobile={12}>
          {renderAddressTextField()}
        </Grid>
        <Box mt={2} />
        <Grid container spacing={2}>
          <Grid item mobile={12} laptop={6}>
            {renderTokensListSelect()}
          </Grid>
          <Grid item mobile={12} laptop={6}>
            {renderTokenAmountTextField()}
          </Grid>
        </Grid>
        <SubmitButton disabled={disabled} loading={isWithdrawPending}>
          Withdraw
        </SubmitButton>

        <ConfirmationModal
          open={confirmationModalOpen}
          title="Confirm Withdraw"
          content={`You are going to withdraw ${formData.amount} of token with id ${formData.tokenId} to address ${formData.address}.`}
          buttonText="Withdraw"
          handleClose={() => setConfirmationModalOpen(false)}
          onConfirm={submit}
        />
      </form>
    </FormProvider>
  );
};

export default WithdrawForm;
