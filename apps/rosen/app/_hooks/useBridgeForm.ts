import { useContext } from 'react';
import { useController } from 'react-hook-form';

import { getNonDecimalString } from '@rosen-ui/utils';

import { useTokensMap } from './useTokensMap';
import useTransactionFormData from './useTransactionFormData';

import { WalletContext } from '@/_contexts/walletContext';

import { validateAddress } from '@/_actions/validateAddress';

import { getMaxTransferableAmount } from '@/_utils';
import { getMinTransferAmount } from '@/_utils/index';

const validationCache = new Map<string, string | undefined>();

/**
 * handles the form field registrations and form state changes
 * and validations
 */

const useBridgeForm = () => {
  const { control, resetField, reset, setValue, formState, setFocus } =
    useTransactionFormData();

  const tokensMap = useTokensMap();

  const walletGlobalContext = useContext(WalletContext);

  const { field: sourceField } = useController({
    name: 'source',
    control,
  });

  const { field: targetField } = useController({
    name: 'target',
    control,
  });

  const { field: tokenField } = useController({
    name: 'token',
    control,
  });

  const { field: amountField } = useController({
    name: 'amount',
    control,
    rules: {
      validate: async (value) => {
        // match any complete or incomplete decimal number
        const match = value.match(/^(\d+(\.(?<floatingDigits>\d+)?)?)?$/);

        // prevent user from entering invalid numbers
        const isValueInvalid = !match;
        if (isValueInvalid) return 'The amount is not valid';

        // prevent user from entering more decimals than token decimals
        const isDecimalsLarge =
          (match?.groups?.floatingDigits?.length ?? 0) >
          tokenField.value?.decimals;
        if (isDecimalsLarge)
          return `The current token only supports ${tokenField.value?.decimals} decimals`;

        if (walletGlobalContext!.state.selectedWallet) {
          // prevent user from entering more than token amount
          const maxTransferableAmount = getMaxTransferableAmount(
            await walletGlobalContext!.state.selectedWallet.getBalance(
              tokenField.value,
            ),
            sourceField.value,
            tokenField.value.metaData.type === 'native',
          );
          const isAmountLarge =
            BigInt(getNonDecimalString(value, tokenField.value?.decimals)) >
            BigInt(maxTransferableAmount.toString());
          if (isAmountLarge) return 'Balance insufficient';
        }

        const minTransferableAmount = await getMinTransferAmount(
          tokenField.value,
          sourceField.value,
          tokensMap,
        );
        const isAmountSmall =
          BigInt(getNonDecimalString(value, tokenField.value?.decimals)) <
          BigInt(
            getNonDecimalString(
              minTransferableAmount.toString(),
              tokenField.value.decimals,
            ),
          );
        if (isAmountSmall) return 'Minimum transferable amount not respected';

        return undefined;
      },
    },
  });

  const { field: addressField } = useController({
    name: 'walletAddress',
    control,
    rules: {
      validate: async (value) => {
        if (!value) {
          return 'Address cannot be empty';
        }

        const cacheKey = `${targetField.value}__${value}`;

        if (validationCache.has(cacheKey)) {
          return validationCache.get(cacheKey);
        }

        const validationResult = (
          await validateAddress(targetField.value, value)
        ).message;
        validationCache.set(cacheKey, validationResult);

        return validationResult;
      },
    },
  });

  return {
    reset,
    setValue,
    resetField,
    setFocus,
    sourceField,
    targetField,
    tokenField,
    amountField,
    addressField,
    formState,
  };
};

export default useBridgeForm;
