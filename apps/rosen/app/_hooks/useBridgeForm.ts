import { useController } from 'react-hook-form';

import useTransactionFormData from './useTransactionFormData';

import { validateAddress } from '@/_actions/validateAddress';

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
        return (await validateAddress(targetField.value, value)).message;
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
