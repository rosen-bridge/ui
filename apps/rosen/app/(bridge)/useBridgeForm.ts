import { useMemo } from 'react';

import { useForm } from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { Network as NetworkKey } from '@rosen-ui/types';

import { useTokenMap } from '@/_hooks';
import { networks } from '@/_networks';

export type BridgeFormValues = {
  source: string | null;
  target: string | null;
  token: string | null;
  walletAddress: string | null;
  amount: RosenAmountValue | null;
};

export const useBridgeForm = () => {
  const [methods, FormProvider, Form] = useForm<BridgeFormValues>({
    defaultValues: {
      source: null,
      target: null,
      token: null,
      walletAddress: null,
      amount: null,
    },
    onSubmit: (values) => {
      console.log('zzz Form submitted with data:', values);
    },
  });

  const tokenMap = useTokenMap();
  const sources = useMemo(() => {
    return (tokenMap.getAllChains() as NetworkKey[])
      .filter((chain) => !!NETWORKS[chain])
      .map((chain) => networks[chain]);
  }, [tokenMap]);

  // const onSubmit = handleSubmit((data) =>
  //   console.log('zzz handleSubmit', data),
  // );

  //   useEffect(() => {
  //     const { unsubscribe } = watch((value, { name, type }) => {
  //       console.log('zzz useEffect', value, name, type);
  //       if (name === 'source') {
  //         reset({
  //           source: value.source,
  //           walletAddress: value.walletAddress,
  //         });
  //       } else if (name === 'target') {
  //         reset({
  //           source: value.source,
  //           target: value.target,
  //           walletAddress: value.walletAddress,
  //         });
  //       } else if (name === 'token') {
  //         reset({
  //           source: value.source,
  //           target: value.target,
  //           token: value.token,
  //           walletAddress: value.walletAddress,
  //         });
  //       }
  //     });
  //     return () => unsubscribe();
  //   }, [watch]);

  const { watch, setValue, resetField, reset } = methods;

  const fields = {
    source: {
      name: 'source',
      label: 'Source',
      options: sources,
      rules: { required: true },
    },
    target: {
      name: 'target',
      label: 'Target',
      options: sources,
      optionKey: 'name',
      optionLabel: 'label',
      rules: { required: true },
    },
    token: {
      name: 'token',
      label: 'Token',
      disabled: !watch('target'),
    },
  };

  return [fields, methods, FormProvider, Form] as const;
};
