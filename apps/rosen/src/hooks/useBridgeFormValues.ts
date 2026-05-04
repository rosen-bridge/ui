import { useFormContext, useWatch } from 'react-hook-form';

import { BridgeForm } from '@/app/(bridge)/page';

/**
 * provide access to the bridge form context and current form values
 */

export const useBridgeFormValues = () => {
  const { control } = useFormContext<BridgeForm>();

  const amount = useWatch({ control, name: 'amount' });
  const source = useWatch({ control, name: 'source' });
  const target = useWatch({ control, name: 'target' });
  const token = useWatch({ control, name: 'token' });
  const walletAddress = useWatch({ control, name: 'walletAddress' });

  return {
    amount,
    source,
    target,
    token,
    walletAddress,
  };
};
