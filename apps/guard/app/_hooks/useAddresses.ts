import { useMemo } from 'react';
import { Network } from '@rosen-ui/types';

import { useInfo } from './useInfo';

type Addresses = {
  [key in 'cold' | 'hot']: {
    [key in Network]?: string;
  };
};

/**
 * returns hot and cold addresses
 */
export const useAddresses = () => {
  const { data } = useInfo();
  return useMemo(() => {
    const addresses: Addresses = {
      cold: {},
      hot: {},
    };

    data?.balances.cold.forEach((item) => {
      addresses.cold[item.chain] = item.address;
    });

    data?.balances.hot.forEach((item) => {
      addresses.hot[item.chain] = item.address;
    });

    return addresses;
  }, [data]);
};
