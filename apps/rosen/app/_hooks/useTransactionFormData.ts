import { useWatch, useFormContext, FieldValues } from 'react-hook-form';

import type { BridgeForm } from '@/(bridge)/page';

/**
 * provide access to the bridge form context and current form values
 */

export const useTransactionFormData = () => {
  const { control, ...rest } = useFormContext<FieldValues, BridgeForm>();

  const amountValue = useWatch({ control, name: 'amount' });

  return {
    amountValue,
    control,
    ...rest,
  };
};
