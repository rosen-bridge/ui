import { type MouseEventHandler, useEffect } from 'react';

import { useController, useFormContext } from 'react-hook-form';

import {
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
  TextField,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import type { TokenInfo } from '@rosen-ui/types';
import { getDecimalString, getNonDecimalString } from '@rosen-ui/utils';

export interface TokenAmountCompatibleFormSchema {
  amount: string;
}

interface TokenAmountTextFieldProps {
  disabled: boolean;
  loading?: boolean;
  token: Pick<TokenInfo, 'amount' | 'decimals' | 'name'> | undefined;
  minBoxValue?: number;
  setMinValue?: boolean;
}

/**
 * Render a react-hook-form compatible text field for token amount input,
 * handling decimal and maximum available validation for token, enabling user to
 * choose maximum available amount for text field, setting minimum value for
 * the text field when the `token` prop changes and optionally showing a pending
 * indicator.
 *
 * @param disabled - Disable the input field.
 * @param loading - Show a loading indicator when data is pending.
 * @param token - Token information used for validation and formatting.
 * @param minBoxValue - Minimum allowed value for the input, applied when token changes.
 * @param setMinValue - Set smallest non-zero amount on token change.
 */
export const TokenAmountTextField = ({
  disabled,
  loading,
  token,
  minBoxValue,
  setMinValue,
}: TokenAmountTextFieldProps) => {
  const { control, setValue } =
    useFormContext<TokenAmountCompatibleFormSchema>();

  const { field: amountField, fieldState } = useController({
    control: control,
    name: 'amount',
    rules: {
      validate: (value) => {
        if (!token) return 'Token must be selected first';

        const newValue = value?.trim() || '';

        if (!newValue) return 'Amount is required';

        // match any complete or incomplete decimal number
        const match = newValue.match(/^(\d+(\.(?<floatingDigits>\d+)?)?)?$/);
        if (!match) return 'Invalid amount';

        // prevent user from entering more decimals than token decimals
        const isDecimalsLarge =
          (match?.groups?.floatingDigits?.length ?? 0) > token.decimals;
        if (isDecimalsLarge)
          return `The current token only supports ${token.decimals} ${token.decimals <= 1 ? 'decimal' : 'decimals'}`;

        const newValueBigInt = BigInt(
          getNonDecimalString(newValue, token.decimals),
        );

        // prevent user from entering more than token amount
        if (newValueBigInt > token.amount) return `Insufficient balance`;

        if (
          token.name === NETWORKS.ergo.nativeToken &&
          minBoxValue &&
          newValueBigInt < BigInt(minBoxValue)
        ) {
          return `Amount must be at least ${getDecimalString(minBoxValue.toString(), token.decimals)}`;
        }

        if (newValueBigInt === 0n) return 'Amount must be greater than 0';

        return true;
      },
    },
  });

  useEffect(() => {
    if (!setMinValue) return;

    if (!token) return;

    const value = token.decimals ? `0.${'0'.repeat(token.decimals - 1)}1` : '1';

    setValue('amount', value, { shouldValidate: true });
  }, [token, setValue, setMinValue]);

  const setAmountFieldValue = (value: string) =>
    setValue('amount', value, { shouldValidate: true });

  const getMaxAvailableTokenAmount = () =>
    getDecimalString(token?.amount.toString(), token?.decimals);

  const setAmountToMaxAvailable: MouseEventHandler = (event) => {
    event.preventDefault();

    setAmountFieldValue(getMaxAvailableTokenAmount());
  };

  return (
    <TextField
      variant="filled"
      label="Amount"
      {...amountField}
      disabled={disabled}
      error={!!fieldState.error}
      helperText={fieldState.error?.message}
      InputProps={{
        disableUnderline: true,
        endAdornment: token && (
          <Stack direction="row" align="center" justify="between" spacing={1.5}>
            <Divider
              orientation="vertical"
              style={{ alignSelf: 'stretch', height: 'auto' }}
            />
            <Button
              disabled={disabled}
              loading={loading}
              size="small"
              onClick={setAmountToMaxAvailable}
            >
              <span style={{ whiteSpace: 'nowrap' }}>
                Use all
                <br />
                {getMaxAvailableTokenAmount()}{' '}
                <small style={{ textTransform: 'none' }}>{token.name}</small>
              </span>
            </Button>
          </Stack>
        ),
        startAdornment: loading && (
          <InputAdornment position="start">
            <CircularProgress size={18} color="inherit" />
          </InputAdornment>
        ),
      }}
    />
  );
};
