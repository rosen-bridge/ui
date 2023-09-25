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

import TokenAmountTextField, {
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

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
    useSWR<ApiAddressAssetsResponse>('/address/assets', fetcher);

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

  const formMethods = useForm({
    defaultValues: {
      address: '',
      tokenId: data?.items?.[0].tokenId ?? '',
      amount: '',
    },
  });
  const { handleSubmit, control, resetField, register, setValue } = formMethods;

  const { field: tokenIdField } = useController({
    control,
    name: 'tokenId',
  });

  const selectedToken = useMemo(
    () => data?.items?.find((token) => token.tokenId === tokenIdField.value),
    [data, tokenIdField.value],
  );

  useEffect(() => {
    if (data && !tokenIdField.value) {
      resetField('tokenId', { defaultValue: data?.items[0].tokenId });
    }
  }, [data, resetField, tokenIdField.value]);

  const onSubmit: SubmitHandler<Form> = async (data) => {
    try {
      const response = await trigger({
        address: data.address,
        tokens: [
          {
            tokenId: data.tokenId,
            amount: BigInt(
              getNonDecimalString(data.amount, selectedToken!.decimals),
            ),
          },
        ],
      });
      if (response === 'OK') {
        setAlertData({
          severity: 'success',
          message: 'withdrawal successful',
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

  const renderAddressTextField = () => (
    <TextField
      autoFocus
      label="Address"
      {...register('address', { required: true })}
    />
  );

  const renderTokensListSelect = () => (
    <TextField
      label="Token"
      select={!isTokensListLoading}
      disabled={isTokensListLoading}
      InputProps={{
        startAdornment: isTokensListLoading && (
          <InputAdornment position="start">
            <CircularProgress size={18} color="inherit" />
          </InputAdornment>
        ),
      }}
      {...tokenIdField}
    >
      {data?.items?.map((token) => (
        <MenuItem value={token.tokenId} key={token.tokenId}>
          {token.name ?? TOKEN_NAME_PLACEHOLDER}
          &nbsp;
          {token.tokenId.length >= 64 && (
            <>
              (<Id id={token.tokenId} />)
            </>
          )}
        </MenuItem>
      ))}
    </TextField>
  );

  const renderTokenAmountTextField = () => (
    <TokenAmountTextField
      disabled={isTokensListLoading}
      token={selectedToken}
    />
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
        <SubmitButton loading={isWithdrawPending}>Withdraw</SubmitButton>
      </form>
    </FormProvider>
  );
};

export default WithdrawForm;
