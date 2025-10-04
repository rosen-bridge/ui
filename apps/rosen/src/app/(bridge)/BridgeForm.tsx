'use client';

import { useCallback, ChangeEvent, SyntheticEvent } from 'react';

import { ClipboardNotes } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  TextField,
  Typography,
  ListItemIcon,
  MenuItem,
  CircularProgress,
  SvgIcon,
  Alert,
  Autocomplete,
  InputAdornment,
  IconButton,
  Stack,
  Columns,
  DividerNew,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';

import {
  useBalance,
  useBridgeForm,
  useMaxTransfer,
  useNetwork,
  useTransactionFormData,
  useWallet,
} from '@/hooks';

import { UseAllAmount } from './UseAllAmount';

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
    tokenValue,
    formState: { isValidating },
  } = useTransactionFormData();

  const { sources, availableSources, availableTargets, availableTokens } =
    useNetwork();

  const { isLoading, raw: balanceRaw } = useBalance();

  const { error, isLoading: isMaxLoading, raw, load } = useMaxTransfer();

  const { selected: selectedWallet } = useWallet();

  const renderSelectedNetwork = (value: unknown) => {
    const network = sources.find((network) => network.name === value)!;
    const Logo = network.logo;
    return (
      <Stack
        direction="row"
        align="center"
        style={{ marginTop: '-1px' }}
        spacing={1}
      >
        <SvgIcon>
          <Logo />
        </SvgIcon>
        <Typography color="text.secondary">{network.label}</Typography>
      </Stack>
    );
  };

  const handleTokenChange = useCallback(
    (e: SyntheticEvent, value: RosenChainToken | null, reason: string) => {
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
    <>
      <Columns
        count={1}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        gap="16px"
        overrides={{
          tablet: { count: 2, gap: '16px', style: { display: 'unset' } },
        }}
      >
        <div>
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
        </div>
        <div>
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
        </div>
      </Columns>
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
            (option as RosenChainToken)?.tokenId ===
            (value as RosenChainToken)?.tokenId
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
              disabled={!addressField.value || !!errors?.walletAddress}
              error={!!error}
              loading={isLoading || isMaxLoading}
              value={balanceRaw}
              unit={(tokenValue as RosenChainToken)?.name}
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

      <TextField
        label="Target Address"
        InputProps={{
          disableUnderline: true,
          endAdornment: (
            <InputAdornment position="end">
              {isValidating ? (
                <Stack direction="row">
                  <div style={{ height: '40px' }}>
                    <DividerNew
                      variant="fullWidth"
                      style={{ display: 'flex' }}
                      orientation="vertical"
                    />
                  </div>
                  <CircularProgress
                    size={24}
                    style={{
                      margin: '8px',
                      verticalAlign: 'middle',
                    }}
                  />
                </Stack>
              ) : (
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
              )}
            </InputAdornment>
          ),
        }}
        variant="filled"
        error={!!errors?.walletAddress}
        helperText={!isValidating && errors.walletAddress?.message?.toString()}
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
    </>
  );
};
