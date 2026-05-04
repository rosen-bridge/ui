'use client';

import { ClipboardNotes } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  Grid,
  TextField,
  Typography,
  CircularProgress,
  SvgIcon,
  Alert,
  Autocomplete,
  InputAdornment,
  IconButton,
  Stack,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import {
  useBalance,
  useBridgeForm,
  useBridgeFormController,
  useBridgeFormValues,
  useMaxTransfer,
  useNetwork,
  useWallet,
} from '@/hooks';

import { NetworkSelectField } from './NetworkSelectField';
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
    formState: { errors, isValidating },
  } = useBridgeForm();

  const { token } = useBridgeFormValues();

  const { sources, availableSources, availableTargets, availableTokens } =
    useNetwork();

  const { isLoading, raw: balanceRaw } = useBalance();

  const { error, isLoading: isMaxLoading, raw, load } = useMaxTransfer();

  const { selected: selectedWallet } = useWallet();

  const controller = useBridgeFormController({
    reset,
    setValue,
    resetField,
    sourceField,
    targetField,
    amountField,
  });

  const renderSelectedNetwork = (value: unknown) => {
    const network = sources.find((network) => network.name === value)!;
    const Logo = network.logo;
    return (
      <Stack direction="row" align="center" spacing={1}>
        <SvgIcon>
          <Logo />
        </SvgIcon>
        <Typography color="text.secondary">{network.label}</Typography>
      </Stack>
    );
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ mobile: 12, tablet: 6 }}>
          <NetworkSelectField
            id="source"
            label="Source"
            value={sourceField.value}
            options={availableSources}
            renderSelected={renderSelectedNetwork}
            onChange={(v) => controller.handleSourceChange(v as Network)}
          />
        </Grid>
        <Grid size={{ mobile: 12, tablet: 6 }}>
          <NetworkSelectField
            id="target"
            label="Target"
            disabled={!sourceField.value}
            value={targetField.value}
            options={availableTargets}
            renderSelected={renderSelectedNetwork}
            onChange={(v) => controller.handleTargetChange(v as Network)}
          />
        </Grid>
      </Grid>
      <TextField
        label="Target Address"
        slotProps={{
          input: {
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={controller.pasteFromClipboard}>
                  <SvgIcon opacity="0.6">
                    <ClipboardNotes />
                  </SvgIcon>
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
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
            (option as RosenChainToken)?.tokenId ===
            (value as RosenChainToken)?.tokenId
          );
        }}
        renderInput={(params) => (
          <TextField {...params} label="Token" name={tokenField.name} />
        )}
        onChange={controller.handleTokenChange}
      />
      <TextField
        id="amount"
        size="medium"
        label="Amount"
        placeholder="0.0"
        error={!!errors?.amount}
        helperText={errors.amount?.message?.toString()}
        slotProps={{
          input: {
            disableUnderline: true,
            endAdornment: token && selectedWallet && (
              <UseAllAmount
                disabled={!addressField.value || !!errors?.walletAddress}
                error={!!error}
                loading={isLoading || isMaxLoading}
                value={balanceRaw}
                unit={token.name}
                onClick={() => {
                  controller.setMaxAmount(raw);
                }}
                onRetry={load}
              />
            ),
          },
          htmlInput: {
            'style': { fontSize: '2rem' },
            'aria-label': 'amount input',
          },
        }}
        variant="filled"
        {...amountField}
        value={amountField.value ?? ''}
        onChange={controller.handleAmountChange}
        disabled={!tokenField.value}
        autoComplete="off"
      />
    </>
  );
};
