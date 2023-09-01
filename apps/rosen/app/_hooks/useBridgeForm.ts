import { useController } from 'react-hook-form';

import useTransactionFormData from './useTransactionFormData';

const useBridgeForm = () => {
  const { control, resetField, reset, setValue } = useTransactionFormData();

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
  };
};

export default useBridgeForm;
