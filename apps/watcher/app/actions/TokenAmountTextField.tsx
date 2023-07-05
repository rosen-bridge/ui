import { useEffect } from 'react';
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
  token: Pick<TokenInfo, 'amount' | 'decimals'> | undefined;
}
/**
 * render a react-hook-form compatible text field for token amount input,
 * handling decimal and maximum available validation for token, enabling user to
 * choose maximum available amount for text field, setting minimum value for
 * the text field when the `token` prop changes and optionally showing a pending
 * indicator
 *
 * @param disabled
 * @param loading
 * @param token
 */
const TokenAmountTextField = ({
  disabled,
  loading,
  token,
}: TokenAmountTextFieldProps) => {
  const { control, setValue } =
    useFormContext<TokenAmountCompatibleFormSchema>();

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

  const setAmountToMaxAvailable = () =>
    setAmountFieldValue(getMaxAvailableTokenAmount());

  return (
    <TextField
      label="Amount"
      disabled={disabled}
      {...amountField}
      onChange={(event) => {
        if (!token) return;

        const newValue = event.target.value;

        // match any complete or incomplete decimal number
        const match = newValue.match(/^(\d+(\.(?<floatingDigits>\d+)?)?)?$/);

        // prevent user from entering invalid numbers
        const isValueInvalid = !match;
        if (isValueInvalid) return;

        // prevent user from entering more decimals than token decimals
        const isDecimalsLarge =
          (match?.groups?.floatingDigits?.length ?? 0) > token.decimals;
        if (isDecimalsLarge) return;

        // prevent user from entering more than token amount
        const isAmountLarge =
          BigInt(getNonDecimalString(newValue, token.decimals)) > token.amount;
        if (isAmountLarge) return;

        amountField.onChange(event);
      }}
      helperText={
        token && (
          <>
            <Link component="button" onClick={setAmountToMaxAvailable}>
              {getMaxAvailableTokenAmount()}
            </Link>{' '}
            available
          </>
        )
      }
      InputProps={{
        endAdornment: token && (
          <InputAdornment position="end">
            <Button size="small" onClick={setAmountToMaxAvailable}>
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

export default TokenAmountTextField;
