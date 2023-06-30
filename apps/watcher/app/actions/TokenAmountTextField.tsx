import { useController, useFormContext } from 'react-hook-form';

import { Button, Link, TextField } from '@rosen-bridge/ui-kit';

import { getDecimalString, getNonDecimalString } from '@/_utils/decimals';

import { TokenInfo } from '@/_types/api';

interface TokenAmountCompatibleFormSchema {
  amount: string;
}

interface TokenAmountTextFieldProps {
  disabled: boolean;
  token: TokenInfo | undefined;
}
/**
 * render a react-hook-form compatible text field for token amount input,
 * handling decimal and maximum available validation for token and enabling user
 * to choose maximum available amount for text field
 *
 * @param disabled
 * @param token
 */
const TokenAmountTextField = ({
  disabled,
  token,
}: TokenAmountTextFieldProps) => {
  const { control, setValue } =
    useFormContext<TokenAmountCompatibleFormSchema>();

  const { field: amountField } = useController({
    control: control,
    name: 'amount',
  });

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
          <Button size="small" onClick={setAmountToMaxAvailable}>
            Max
          </Button>
        ),
      }}
    />
  );
};

export default TokenAmountTextField;
