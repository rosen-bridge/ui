'use client';

import { useCallback, ChangeEvent } from 'react';
import Image from 'next/image';
import { getNonDecimalString } from '@rosen-ui/utils';

import {
  alpha,
  Grid,
  TextField,
  Typography,
  ListItemIcon,
  styled,
  MenuItem,
  Button,
} from '@rosen-bridge/ui-kit';

import useBridgeForm from '@/_hooks/useBridgeForm';
import useNetwork from '@/_hooks/useNetwork';

import { getTokenNameAndId } from '@/_utils';
import useTokenBalance from '@/_hooks/useTokenBalance';

/**
 * customized form input
 */
const FormInputs = styled(TextField)(({ theme }) => ({
  '& .MuiFilledInput-root': {
    overflow: 'hidden',
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.background.input,
    minHeight: theme.spacing(8.5),

    transition: theme.transitions.create(['background-color', 'box-shadow']),
    '&:hover': {
      backgroundColor: theme.palette.background.header,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.header,
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
    },
    'input::-webkit-outer-spin-button,input::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
    },
  },
}));

/**
 * max button component container for amount field
 */
const MaxButton = styled(Button)(({ theme }) => ({
  padding: 0,
  fontSize: theme.spacing(1.5),
}));

/**
 * bridge form container comp
 */
const SelectedAsset = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  margin: theme.spacing(0.5),
}));

/**
 * bridge form container comp
 */
const FormContainer = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

/**
 * renders the bridge main form
 */
const BridgeForm = () => {
  const {
    reset,
    setValue,
    resetField,
    sourceField,
    targetField,
    tokenField,
    amountField,
    addressField,
    formState: { errors },
  } = useBridgeForm();

  const { availableNetworks, tokens, targetNetworks } = useNetwork();
  const { isLoading, amount } = useTokenBalance();

  const renderSelectedAsset = (value: unknown) => {
    const network = availableNetworks.find(
      (network) => network.name === value,
    )!;
    return (
      <SelectedAsset>
        <Image src={network.logo} width={24} height={24} alt="network logo" />
        <Typography variant="button" color="text.secondary">
          {network.label}
        </Typography>
      </SelectedAsset>
    );
  };

  const handleTokenChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const currentToken = tokens.find(
        (token) =>
          getTokenNameAndId(token, sourceField.value)?.tokenId ===
          e.target.value,
      );
      setValue('token', currentToken, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('amount', '');
      resetField('amount');
    },
    [setValue, resetField, tokens, sourceField],
  );

  const handleSourceChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value !== sourceField.value) {
        reset({
          target: null,
          token: null,
          amount: '',
          walletAddress: '',
          source: e.target.value,
        });
      }
    },
    [reset, sourceField],
  );

  const handleTargetChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.value !== targetField.value) {
        reset({
          source: sourceField.value,
          target: e.target.value,
          token: null,
          amount: '',
          walletAddress: '',
        });
      }
    },
    [reset, sourceField, targetField],
  );

  const handleAmountChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;

      // match any complete or incomplete decimal number
      const match = newValue.match(/^(\d+(\.(?<floatingDigits>\d+)?)?)?$/);

      // prevent user from entering invalid numbers
      const isValueInvalid = !match;
      if (isValueInvalid) return;

      // prevent user from entering more decimals than token decimals
      const isDecimalsLarge =
        (match?.groups?.floatingDigits?.length ?? 0) >
        tokenField.value?.decimals;
      if (isDecimalsLarge) return;

      // prevent user from entering more than token amount
      const isAmountLarge =
        BigInt(getNonDecimalString(newValue, tokenField.value?.decimals)) >
        BigInt(
          getNonDecimalString(amount.toString(), tokenField.value?.decimals),
        );
      if (isAmountLarge) return;

      amountField.onChange(event);
    },
    [amountField, tokenField, amount],
  );

  const handleSelectMax = useCallback(() => {
    setValue('amount', amount, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [setValue, amount]);

  const renderInputActions = () => (
    <Grid container justifyContent="space-between">
      <MaxButton
        disabled={isLoading || !tokenField.value}
        onClick={handleSelectMax}
        color="primary"
      >
        <Typography variant="caption">
          {`Balance: ${isLoading ? 'loading...' : amount}`}
        </Typography>
      </MaxButton>
      <MaxButton
        disabled={isLoading || !tokenField.value}
        onClick={handleSelectMax}
        color="primary"
      >
        MAX
      </MaxButton>
    </Grid>
  );

  return (
    <FormContainer>
      <Grid container spacing={1}>
        <Grid item mobile={6}>
          <FormInputs
            id="source"
            select
            label="Source"
            inputProps={{ 'aria-label': 'source input' }}
            InputProps={{ disableUnderline: true }}
            variant="filled"
            {...sourceField}
            SelectProps={{
              renderValue: renderSelectedAsset,
            }}
            onChange={handleSourceChange}
          >
            {availableNetworks.map((network) => (
              <MenuItem key={network.name} value={network.name}>
                <ListItemIcon>
                  <Image
                    src={network.logo}
                    width={24}
                    height={24}
                    alt="network logo"
                  />
                </ListItemIcon>
                <Typography color="text.secondary">{network.label}</Typography>
              </MenuItem>
            ))}
          </FormInputs>
        </Grid>
        <Grid item mobile={6}>
          <FormInputs
            id="target"
            select
            label="Target"
            disabled={!sourceField.value}
            inputProps={{ 'aria-label': 'target input' }}
            InputProps={{ disableUnderline: true }}
            variant="filled"
            {...targetField}
            SelectProps={{
              renderValue: renderSelectedAsset,
            }}
            onChange={handleTargetChange}
          >
            {targetNetworks.map((network) => (
              <MenuItem key={network.name} value={network.name}>
                <ListItemIcon>
                  <Image
                    src={network.logo}
                    width={24}
                    height={24}
                    alt="network logo"
                  />
                </ListItemIcon>
                <Typography color="text.secondary">{network.label}</Typography>
              </MenuItem>
            ))}
          </FormInputs>
        </Grid>
      </Grid>
      <FormInputs
        id="token"
        select
        label="Token"
        disabled={!tokens.length}
        InputProps={{ disableUnderline: true }}
        inputProps={{ 'aria-label': 'token input' }}
        variant="filled"
        {...tokenField}
        value={
          tokenField.value
            ? getTokenNameAndId(tokenField.value, sourceField.value)?.tokenId
            : ''
        }
        onChange={handleTokenChange}
      >
        {tokens.map((token) => {
          const { tokenId, tokenName } = getTokenNameAndId(
            token,
            sourceField.value,
          )!;
          return (
            <MenuItem key={tokenId} value={tokenId}>
              {tokenName}
            </MenuItem>
          );
        })}
      </FormInputs>
      <FormInputs
        id="amount"
        size="medium"
        label="Amount"
        placeholder="0.0"
        helperText={renderInputActions()}
        InputProps={{ disableUnderline: true }}
        inputProps={{
          style: { fontSize: '2rem' },
          'aria-label': 'amount input',
        }}
        variant="filled"
        {...amountField}
        onChange={handleAmountChange}
        disabled={!tokenField.value}
      />
      <FormInputs
        label="Address"
        InputProps={{ disableUnderline: true } as any}
        variant="filled"
        error={!!errors?.walletAddress}
        helperText={errors.walletAddress?.message?.toString()}
        disabled={!sourceField.value}
        {...addressField}
      />
    </FormContainer>
  );
};

export default BridgeForm;
