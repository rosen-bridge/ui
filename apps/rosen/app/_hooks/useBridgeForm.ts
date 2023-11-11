import { useController } from 'react-hook-form';

import useTransactionFormData from './useTransactionFormData';

import { validateAddress } from '@/_actions/validateAddress';

const validationCache = new Map<string, string | undefined>();

/**
 * handles the form field registrations and form state changes
 * and validations
 */

const useBridgeForm = () => {
  const { control, resetField, reset, setValue, formState, setFocus } =
    useTransactionFormData();

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
