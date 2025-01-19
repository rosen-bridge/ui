'use client';

import { useCallback, ChangeEvent } from 'react';

import { Paste } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  Grid,
  TextField,
  Typography,
  ListItemIcon,
  styled,
  MenuItem,
  CircularProgress,
  SvgIcon,
  Alert,
  Autocomplete,
  InputAdornment,
  IconButton,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getDecimalString } from '@rosen-ui/utils';

import {
  useBalance,
  useBridgeForm,
  useMaxTransfer,
  useNetwork,
  useTokenMap,
  useTransactionFormData,
  useWallet,
} from '@/_hooks';
import { theme } from '@/_theme/theme';
import { getTokenNameAndId } from '@/_utils';

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

  const { sources, availableSources, availableTargets, availableTokens } =
    useNetwork();

  const { isLoading, amount } = useBalance();

  const {
    error,
    amount: max,
    isLoading: isMaxLoading,
    load,
  } = useMaxTransfer();
  const tokenMap = useTokenMap();

  const { selectedWallet } = useWallet();

  const renderSelectedNetwork = (value: unknown) => {
    const network = sources.find((network) => network.name === value)!;
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
    (
      e: React.SyntheticEvent,
      value: RosenChainToken | null,
      reason: string,
    ) => {
      if (reason == 'clear') return;
      const currentToken = value || undefined;
      setValue('token', currentToken, {
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue('amount', '');
      resetField('amount');
    },
    [setValue, resetField],
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
      <Grid container spacing={2}>
        <Grid item mobile={6} tablet={12} laptop={6}>
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
            {availableSources.map(({ logo: Logo, ...network }) => (
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
        <Grid item mobile={6} tablet={12} laptop={6}>
          <TextField
            id="target"
            select
            label="Target"
            disabled={!sourceField.value}
            inputProps={{ 'aria-label': 'target input' }}
            InputProps={{ disableUnderline: true }}
            variant="filled"
            {...targetField}
            // CAUTION: THIS LOGICAL OR PREVENTS TO MAKE AN ERROR DURING RUNTIME.
            value={targetField.value ?? ''}
            SelectProps={{
              renderValue: renderSelectedNetwork,
            }}
            onChange={handleTargetChange}
          >
            {availableTargets.map(({ logo: Logo, ...network }) => (
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
        label="Target Address"
        InputProps={
          {
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  sx={{
                    cursor: 'pointer',
                    color: 'secondary',
                  }}
                  onClick={async () => {
                    try {
                      const clipboardText =
                        await navigator.clipboard.readText();
                      addressField.onChange(clipboardText);
                    } catch (err) {
                      console.error('Failed to read clipboard: ', err);
                    }
                  }}
                >
                  <Paste />
                </IconButton>
              </InputAdornment>
            ),
          } as any
        }
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
      {targetField.value == NETWORKS.BITCOIN && (
        <Alert severity="warning">
          Only Native SegWit (P2WPKH or P2WSH) addresses are supported.
        </Alert>
      )}
      <Autocomplete
        aria-label="token input"
        disabled={!availableTokens.length}
        id="token"
        clearIcon={false}
        disablePortal
        options={availableTokens}
        value={tokenField.value}
        getOptionLabel={(option) => option.name || ''}
        isOptionEqualToValue={(option, value) => {
          return (
            getTokenNameAndId(option, sourceField.value)?.tokenId ===
            getTokenNameAndId(value, sourceField.value)?.tokenId
          );
        }}
        renderInput={(params) => (
          <TextField {...params} label="Token" name={tokenField.name} />
        )}
        onChange={handleTokenChange}
      />
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
              error={!!error}
              loading={isLoading || isMaxLoading}
              value={getDecimalString(
                amount.toString(),
                tokenMap.getSignificantDecimals(tokenField.value.tokenId) || 0,
              )}
              unit={
                (
                  tokenValue &&
                  sourceValue &&
                  getTokenNameAndId(tokenValue, sourceValue)
                )?.tokenName
              }
              onClick={handleSelectMax}
              onRetry={load}
            />
          ),
        }}
        inputProps={{
          'style': { fontSize: '2rem' },
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
