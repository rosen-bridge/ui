'use client';

import { useCallback, ChangeEvent } from 'react';
import { getDecimalString } from '@rosen-ui/utils';

import {
  Grid,
  TextField,
  Typography,
  ListItemIcon,
  styled,
  MenuItem,
  Button,
  CircularProgress,
  SvgIcon,
  Alert,
} from '@rosen-bridge/ui-kit';

import useBridgeForm from '@/_hooks/useBridgeForm';
import useNetwork from '@/_hooks/useNetwork';

import { getTokenNameAndId } from '@/_utils';
import { useMaxTransfer } from '@/_hooks/useMaxTransfer';
import useTokenBalance from '@/_hooks/useTokenBalance';
import useTransactionFormData from '@/_hooks/useTransactionFormData';
import { useTokenMap } from '@/_hooks/useTokenMap';
import useWallet from '@/_hooks/useWallet';
import { UseAllAmount } from './UseAllAmount';

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
export const BridgeForm = () => {
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

  const {
    sourceValue,
    tokenValue,
    formState: { isValidating },
  } = useTransactionFormData();

  const { availableNetworks, tokens, targetNetworks } = useNetwork();

  const { isLoading, amount, token } = useTokenBalance();

  const { error, max, loading: isMaxLoading, load } = useMaxTransfer();
  const tokenMap = useTokenMap();

  const { selectedWallet } = useWallet();

  const renderSelectedNetwork = (value: unknown) => {
    const network = availableNetworks.find(
      (network) => network.name === value,
    )!;
    const Logo = network.logo;
    return (
      <SelectedAsset>
        <SvgIcon>
          <Logo />
        </SvgIcon>
        <Typography color="text.secondary">{network.label}</Typography>
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
      amountField.onChange(event);
    },
    [amountField],
  );

  const handleSelectMax = useCallback(async () => {
    const value = getDecimalString(
      max.toString(),
      tokenMap.getSignificantDecimals(tokenField.value?.tokenId) || 0,
    );

    setValue('amount', value, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [max, tokenMap, tokenField.value, setValue]);

  return (
    <FormContainer>
      <Grid container spacing={1}>
        <Grid item mobile={6}>
          <TextField
            id="source"
            select
            label="Source"
            inputProps={{ 'aria-label': 'source input' }}
            InputProps={{ disableUnderline: true }}
            variant="filled"
            {...sourceField}
            SelectProps={{
              renderValue: renderSelectedNetwork,
            }}
            onChange={handleSourceChange}
          >
            {availableNetworks.map(({ logo: Logo, ...network }) => (
              <MenuItem key={network.name} value={network.name}>
                <ListItemIcon>
                  <SvgIcon>
                    <Logo />
                  </SvgIcon>
                </ListItemIcon>
                <Typography color="text.secondary">{network.label}</Typography>
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item mobile={6}>
          <TextField
            id="target"
            select
            label="Target"
            disabled={!sourceField.value}
            inputProps={{ 'aria-label': 'target input' }}
            InputProps={{ disableUnderline: true }}
            variant="filled"
            {...targetField}
            SelectProps={{
              renderValue: renderSelectedNetwork,
            }}
            onChange={handleTargetChange}
          >
            {targetNetworks.map(({ logo: Logo, ...network }) => (
              <MenuItem key={network.name} value={network.name}>
                <ListItemIcon>
                  <ListItemIcon>
                    <SvgIcon>
                      <Logo />
                    </SvgIcon>
                  </ListItemIcon>
                </ListItemIcon>
                <Typography color="text.secondary">{network.label}</Typography>
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <TextField
        label="Address"
        InputProps={{ disableUnderline: true } as any}
        variant="filled"
        error={!!errors?.walletAddress}
        helperText={
          isValidating ? (
            <CircularProgress size={10} />
          ) : (
            errors.walletAddress?.message?.toString()
          )
        }
        disabled={!targetField.value}
        autoComplete="off"
        {...addressField}
        value={addressField.value ?? ''}
      />
      {targetField.value == 'bitcoin' && (
        <Alert severity="warning">
          Only Native SegWit (P2WPKH or P2WSH) addresses are supported.
        </Alert>
      )}
      <TextField
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
      </TextField>
      <TextField
        id="amount"
        size="medium"
        label="Amount"
        placeholder="0.0"
        error={!!errors?.amount}
        helperText={errors.amount?.message?.toString()}
        InputProps={{
          disableUnderline: true,
          endAdornment: tokenField.value && selectedWallet && (
            <UseAllAmount
              error={error}
              loading={isLoading || isMaxLoading}
              value={getDecimalString(
                amount.toString(),
                tokenMap.getSignificantDecimals(tokenField.value.tokenId) || 0,
              )}
              unit={
                (tokenValue && getTokenNameAndId(tokenValue, sourceValue))
                  ?.tokenName
              }
              onClick={handleSelectMax}
              onRetry={load}
            />
          ),
        }}
        inputProps={{
          style: { fontSize: '2rem' },
          'aria-label': 'amount input',
        }}
        variant="filled"
        {...amountField}
        value={amountField.value ?? ''}
        onChange={handleAmountChange}
        disabled={!tokenField.value}
        autoComplete="off"
      />
    </FormContainer>
  );
};
