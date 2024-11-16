import { useWatch, useFormContext, FieldValues } from 'react-hook-form';

import { Network } from '@rosen-ui/types';

import type { BridgeForm } from '@/(bridge)/page';

/**
 * provide access to the bridge form context and current form values
 */

const useTransactionFormData = () => {
  const { control, ...rest } = useFormContext<FieldValues, BridgeForm>();

  const sourceValue = useWatch({ control, name: 'source' }) as Network | null;
  const targetValue = useWatch({ control, name: 'target' }) as Network | null;
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
