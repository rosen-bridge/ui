'use client';

import { useEffect, useMemo } from 'react';
import {
  FormProvider,
  SubmitHandler,
  useController,
  useForm,
} from 'react-hook-form';

import {
  CircularProgress,
  Identifier,
  InputAdornment,
  SubmitButton,
  TextField,
  useApiKey,
  ApiKeyDialogWarning,
  Link,
  Stack,
  useResponsive,
  useToast,
  useConfirm,
  ApiKeyDialogProtectedAction,
  MenuItemMui,
} from '@rosen-bridge/ui-kit';
import { NETWORKS, TOKEN_NAME_PLACEHOLDER } from '@rosen-ui/constants';
import { fetcher, mutatorWithHeaders } from '@rosen-ui/swr-helpers';
import { getNonDecimalString, getTxURL } from '@rosen-ui/utils';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { useInfo, useToken } from '@/hooks';
import {
  ApiAddressAssetsResponse,
  ApiWithdrawRequestBody,
  ApiWithdrawResponse,
} from '@/types/api';

import {
  TokenAmountTextField,
  TokenAmountCompatibleFormSchema,
} from '../../TokenAmountTextField';

interface Form extends TokenAmountCompatibleFormSchema {
  address: string;
  tokenId: string;
}

const WITHDRAW_ASSETS_PAGE_SIZE = 100;

const fetchAddressAssets = async (): Promise<ApiAddressAssetsResponse> => {
  const items: ApiAddressAssetsResponse['items'] = [];
  let total = 0;

  do {
    const page: ApiAddressAssetsResponse = await fetcher([
      '/address/assets',
      {
        offset: items.length,
        limit: WITHDRAW_ASSETS_PAGE_SIZE,
      },
    ]);

    total = page.total;
    items.push(...page.items);

    if (!page.items.length) break;
  } while (items.length < total);

  return {
    total,
    items,
  };
};

const WithdrawForm = () => {
  const { confirm } = useConfirm();
  const toast = useToast();

  const { data, isLoading: isTokensListLoading } =
    useSWR<ApiAddressAssetsResponse>('/address/assets', fetchAddressAssets);

  const { token: ergToken, isLoading: isErgTokenLoading } = useToken('erg');
  const { apiKey } = useApiKey();

  const tokens = useMemo(
    () => data?.items.filter((token) => !!token.amount),
    [data],
  );

  const info = useInfo();

  const { trigger, isMutating: isWithdrawPending } = useSWRMutation<
    ApiWithdrawResponse,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    '/withdraw',
    ApiWithdrawRequestBody
  >('/withdraw', mutatorWithHeaders);

  useEffect(() => {
    if (!isErgTokenLoading && !ergToken?.amount) {
      toast.add({
        type: 'error',
        dismissible: true,
        description: 'Your wallet is empty. There is nothing to withdraw.',
        timeout: 0,
      });
    }
  }, [isErgTokenLoading, ergToken]);

  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: {
      address: '',
      tokenId: tokens?.[0]?.tokenId ?? '',
      amount: '',
    },
  });
  const { handleSubmit, control, resetField, register, watch, formState } =
    formMethods;

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
    resetField('amount', {
      defaultValue: '',
      keepError: false,
      keepDirty: false,
      keepTouched: false,
    });
    if (tokens && !tokenIdField.value) {
      resetField('tokenId', { defaultValue: tokens?.[0]?.tokenId ?? '' });
    }
  }, [tokens, resetField, tokenIdField.value]);

  const submit = async () => {
    try {
      const response = await trigger({
        data: {
          address: formData.address,
          tokens: [
            {
              tokenId: formData.tokenId,
              amount: BigInt(
                getNonDecimalString(formData.amount, selectedToken!.decimals),
              ),
            },
          ],
        },
        headers: {
          'Api-Key': apiKey!,
        },
      });
      if (response.status === 'OK') {
        toast.add({
          type: 'success',
          description: (
            <>
              Withdrawal is successful. Wait for tx [
              <Link
                target="_blank"
                href={getTxURL(NETWORKS.ergo.key, response.txId) ?? '/'}
              >
                {response.txId}
              </Link>
              ] to be confirmed.
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

  const onSubmit: SubmitHandler<Form> = async () => {
    await confirm({
      title: 'Confirm Withdraw',
      content: `You are going to withdraw ${formData.amount} of token with id ${formData.tokenId} to address ${formData.address}.`,
      confirmText: 'Withdraw',
      onConfirm: submit,
    });
  };

  const disabled =
    isTokensListLoading || isErgTokenLoading || !ergToken?.amount;

  const renderAddressTextField = () => (
    <TextField
      variant="filled"
      InputProps={{
        disableUnderline: true,
      }}
      label="Address"
      disabled={disabled}
      {...register('address', {
        required: 'Address is required',
      })}
      error={!!formMethods.formState.errors.address}
      helperText={
        formMethods.formState.isValidating ? (
          <CircularProgress size={10} />
        ) : (
          formMethods.formState.errors.address?.message
        )
      }
      onBlur={(e) => {
        const trimmed = e.target.value.trim();
        formMethods.setValue('address', trimmed, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }}
    />
  );

  const renderTokensListSelect = () => (
    <TextField
      variant="filled"
      label="Token"
      select={!isTokensListLoading}
      InputProps={{
        disableUnderline: true,
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
        <MenuItemMui value={token.tokenId} key={token.tokenId}>
          {token.name ?? TOKEN_NAME_PLACEHOLDER}
          &nbsp;
          {!token.isNativeToken && (
            <>
              (<Identifier value={token.tokenId} variant="legacy-middle" />)
            </>
          )}
        </MenuItemMui>
      ))}
    </TextField>
  );

  const renderTokenAmountTextField = () => (
    <TokenAmountTextField
      disabled={disabled}
      token={selectedToken}
      minBoxValue={info.data?.minBoxValue}
    />
  );

  const stackDirection = useResponsive({
    mobile: 'column',
    laptop: 'row',
  } as const);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <ApiKeyDialogWarning />
          {renderAddressTextField()}
          <Stack direction={stackDirection} spacing={2}>
            {renderTokensListSelect()}
            {renderTokenAmountTextField()}
          </Stack>
          <ApiKeyDialogProtectedAction>
            <SubmitButton
              disabled={!formState.isValid || disabled}
              loading={isWithdrawPending}
            >
              Withdraw
            </SubmitButton>
          </ApiKeyDialogProtectedAction>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default WithdrawForm;
