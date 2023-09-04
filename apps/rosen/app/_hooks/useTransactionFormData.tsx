import { useWatch, useFormContext } from 'react-hook-form';

const useTransactionFormData = () => {
  const { control, ...rest } = useFormContext();

  const sourceValue = useWatch({ control, name: 'source' });
  const targetValue = useWatch({ control, name: 'target' });
  const tokenValue = useWatch({ control, name: 'token' });
  const amountValue = useWatch({ control, name: 'amount' });
  const walletAddressValue = useWatch({ control, name: 'walletAddress' });

  return {
    sourceValue,
    targetValue,
    tokenValue,
    amountValue,
    walletAddressValue,
    control,
    ...rest,
  };
};

export default useTransactionFormData;
