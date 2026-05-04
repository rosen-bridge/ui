import { ChangeEvent, SyntheticEvent, useCallback } from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { Network } from '@rosen-ui/types';

type Props = {//TODO
  reset: any;
  setValue: any;
  resetField: any;
  sourceField: any;
  targetField: any;
  amountField: any;
};

export const useBridgeFormController = ({
  reset,
  setValue,
  resetField,
  sourceField,
  targetField,
  amountField,
}: Props) => {
  const handleSourceChange = useCallback(
    (value: Network) => {
      if (value !== sourceField.value) {
        reset({
          target: null,
          token: null,
          amount: '',
          walletAddress: '',
          source: value,
        });
      }
    },
    [reset, sourceField.value],
  );

  const handleTargetChange = useCallback(
    (value: Network) => {
      if (value !== targetField.value) {
        reset({
          source: sourceField.value,
          target: value,
          token: null,
          amount: '',
          walletAddress: '',
        });
      }
    },
    [reset, sourceField.value, targetField.value],
  );

  const handleTokenChange = useCallback(
    (
      e: SyntheticEvent,
      value: RosenChainToken | null,
      reason: string,
    ) => {
      if (reason === 'clear') return;

      setValue('token', value, {
        shouldDirty: true,
        shouldTouch: true,
      });

      setValue('amount', '');
      resetField('amount');
    },
    [setValue, resetField],
  );

  const handleAmountChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      amountField.onChange(e);
    },
    [amountField],
  );

  const setMaxAmount = useCallback(
    (raw: string) => {
      setValue('amount', raw, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const pasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();

      setValue('walletAddress', text.trim(), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } catch (err) {
      console.error(err);
    }
  }, [setValue]);

  return {
    handleSourceChange,
    handleTargetChange,
    handleTokenChange,
    handleAmountChange,
    setMaxAmount,
    pasteFromClipboard,
  };
};
