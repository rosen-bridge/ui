import { useController } from 'react-hook-form';

import useTransactionFormData from './useTransactionFormData';

import { AddressValidator } from '@/_actions';

const useBridgeForm = () => {
  const { control, resetField, reset, setValue, formState } =
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
      required: true,
      validate: async (value) => (await AddressValidator(value)).message,
    },
  });

  return {
    reset,
    setValue,
    resetField,
    sourceField,
    targetField,
    tokenField,
    amountField,
    addressField,
    formState,
  };
};

export default useBridgeForm;
