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
  AlertProps,
  Box,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
} from '@rosen-bridge/ui-kit';
import { fetcher, mutator } from '@rosen-ui/swr-helpers';

import AlertCard from '../../AlertCard';
import SubmitButton from '../../SubmitButton';
import TokenAmountTextField, {
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

import { getNonDecimalString } from '@/_utils/decimals';

import { TOKEN_NAME_PLACEHOLDER } from '@/_constants';

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
  const { data: tokens, isLoading: isTokensListLoading } =
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
      tokenId: tokens?.[0].tokenId ?? '',
      amount: '',
    },
  });
  const { handleSubmit, control, resetField, register, setValue } = formMethods;

  const { field: tokenIdField } = useController({
    control,
    name: 'tokenId',
  });

  const selectedToken = useMemo(
    () => tokens?.find((token) => token.tokenId === tokenIdField.value),
    [tokens, tokenIdField.value]
  );

  useEffect(() => {
    if (tokens && !tokenIdField.value) {
      resetField('tokenId', { defaultValue: tokens[0].tokenId });
    }
  }, [tokens, resetField, tokenIdField.value]);

  const onSubmit: SubmitHandler<Form> = async (data) => {
    try {
      const response = await trigger({
        address: data.address,
        tokens: {
          tokenId: data.tokenId,
          amount: BigInt(
            getNonDecimalString(data.amount, selectedToken!.decimals)
          ),
        },
      });
      if (response === 'OK') {
        setAlertData({
          severity: 'success',
          message: 'withdrawal successful',
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
      {tokens?.map((token) => (
        <MenuItem value={token.tokenId} key={token.tokenId}>
          {token.name ?? TOKEN_NAME_PLACEHOLDER}
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
