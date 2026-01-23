import { useMemo } from 'react';

import { Network } from '@rosen-ui/types';

import { useBalance } from './useBalance';

type Addresses = {
  [key in 'cold' | 'hot']: {
    [key in Network]?: string;
  };
};

/**
 * returns hot and cold addresses
 */
export const useAddresses = () => {
  const { data } = useBalance();
  return useMemo(() => {
    const addresses: Addresses = {
      cold: {},
      hot: {},
    };

    data?.cold.items.forEach((item) => {
      addresses.cold[item.chain] = item.address;
    });

    data?.hot.items.forEach((item) => {
      addresses.hot[item.chain] = item.address;
    });

    return addresses;
  }, [data]);
};
