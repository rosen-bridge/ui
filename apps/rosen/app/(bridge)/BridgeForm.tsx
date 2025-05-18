'use client';

import { useCallback, ChangeEvent } from 'react';

import { ClipboardNotes } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  Grid,
  TextField,
  styled,
  CircularProgress,
  SvgIcon,
  Alert,
  Autocomplete,
  InputAdornment,
  IconButton,
  IconSelectField,
  SelectedNetwork,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';

import {
  useBalance,
  useBridgeForm,
  useMaxTransfer,
  useNetwork,
  useTransactionFormData,
  useWallet,
} from '@/_hooks';
import { getTokenNameAndId } from '@/_utils';

import { UseAllAmount } from './UseAllAmount';

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

  const { isLoading, raw: balanceRaw } = useBalance();

  const {
    error,
    amount: max,
    isLoading: isMaxLoading,
    raw,
    load,
  } = useMaxTransfer();

  const { selected: selectedWallet } = useWallet();

  const renderSelectedNetwork = (value: unknown) => {
    const network = sources.find((network) => network.name === value)!;
    return <SelectedNetwork label={network.label} Logo={network.logo} />;
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

  const handleSelectMax = useCallback(() => {
    setValue('amount', raw, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [raw, setValue]);

  return (
    <FormContainer>
      <Grid container spacing={2}>
        <Grid item mobile={6} tablet={6} laptop={6}>
          <IconSelectField
            id="source"
            label="Source"
            value={sourceField.value}
            onChange={handleSourceChange}
            options={availableSources.map(({ name, label, logo }) => ({
              name,
              label,
              Logo: logo,
            }))}
            disabled={sourceField.disabled}
            error={!!errors?.source}
            helperText={errors.source?.message?.toString()}
          />
        </Grid>
        <Grid item mobile={6} tablet={6} laptop={6}>
          <IconSelectField
            id="target"
            label="Target"
            value={targetField.value}
            onChange={handleTargetChange}
            options={availableTargets.map(({ name, label, logo }) => ({
              name,
              label,
              Logo: logo,
            }))}
            disabled={!sourceField.value}
            error={!!errors?.target}
            helperText={errors.target?.message?.toString()}
          />
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
                      setValue('walletAddress', clipboardText.trim(), {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                    } catch (err) {
                      console.error('Failed to read clipboard: ', err);
                    }
                  }}
                >
                  <SvgIcon sx={{ opacity: '0.6' }}>
                    <ClipboardNotes />
                  </SvgIcon>
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
        onBlur={(e) => {
          const trimmed = e.target.value.trim();
          setValue('walletAddress', trimmed, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
      />
      {targetField.value == NETWORKS.bitcoin.key && (
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
              value={balanceRaw}
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
