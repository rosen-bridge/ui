import { MouseEventHandler, useEffect, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import {
  Button,
  CircularProgress,
  InputAdornment,
  Link,
  TextField,
} from '@rosen-bridge/ui-kit';
import { TokenInfo } from '@rosen-ui/types';
import { getDecimalString, getNonDecimalString } from '@rosen-ui/utils';

export interface TokenAmountCompatibleFormSchema {
  amount: string;
}

interface TokenAmountTextFieldProps {
  disabled: boolean;
  loading?: boolean;
  token: Pick<TokenInfo, 'amount' | 'decimals' | 'name'> | undefined;
  minBoxValue?: bigint;
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
 */
export const TokenAmountTextField = ({
  disabled,
  loading,
  token,
  minBoxValue,
}: TokenAmountTextFieldProps) => {
  const { control, setValue } =
    useFormContext<TokenAmountCompatibleFormSchema>();

  const [error, setError] = useState<string | undefined>();

  const { field: amountField } = useController({
    control: control,
    name: 'amount',
  });

  useEffect(() => {
    const getMinAmount = () =>
      token!.decimals ? `0.${'0'.repeat(token!.decimals - 1)}1` : '1';

    if (token) {
      setValue('amount', getMinAmount());
    }
  }, [token, setValue]);

  const setAmountFieldValue = (value: string) => setValue('amount', value);

  const getMaxAvailableTokenAmount = () =>
    getDecimalString(token!.amount.toString(), token!.decimals);

  const setAmountToMaxAvailable: MouseEventHandler = (event) => {
    event.preventDefault();

    setAmountFieldValue(getMaxAvailableTokenAmount());
    setError(undefined);
  };

  return (
    <TextField
      label="Amount"
      {...amountField}
      disabled={disabled}
      error={!!error}
      onChange={(event) => {
        if (!token) return;

        const newValue = event.target.value;

        // match any complete or incomplete decimal number
        const match = newValue.match(/^(\d+(\.(?<floatingDigits>\d+)?)?)?$/);
        if (!match) return;

        // prevent user from entering more decimals than token decimals
        const isDecimalsLarge =
          (match?.groups?.floatingDigits?.length ?? 0) > token.decimals;
        if (isDecimalsLarge) return;

        const newValueBigInt = BigInt(
          getNonDecimalString(newValue, token.decimals),
        );

        // prevent user from entering more than token amount
        if (newValueBigInt > token.amount) return;

        if (minBoxValue && newValueBigInt < minBoxValue) {
          setError(
            `Amount must be at least ${getDecimalString(
              minBoxValue.toString(),
              token.decimals,
            )}`,
          );
        } else {
          setError(undefined);
        }

        amountField.onChange(event);
      }}
      helperText={
        error ||
        (token && (
          <>
            <Link component="button" onClick={setAmountToMaxAvailable}>
              {getMaxAvailableTokenAmount()}
            </Link>{' '}
            {token.name} available
          </>
        ))
      }
      InputProps={{
        endAdornment: token && (
          <InputAdornment position="end">
            <Button
              size="small"
              onClick={setAmountToMaxAvailable}
              disabled={disabled}
            >
              Max
            </Button>
          </InputAdornment>
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
