import { useState } from 'react';

import { Networks } from '@/_constants';
import {
  createBitcoinNetwork,
  createCardanoNetwork,
  createErgoNetwork,
} from '@/_networks';

const availableNetworks = {
  [Networks.bitcoin]: createBitcoinNetwork(),
  [Networks.cardano]: createCardanoNetwork(),
  [Networks.ergo]: createErgoNetwork(),
};

export const useAvailableNetworks = () => {
  const [networks, setNetworks] = useState(availableNetworks);

  const reload = () => {
    const next = {} as any;

    next[Networks.bitcoin] = createBitcoinNetwork();
    next[Networks.cardano] = createCardanoNetwork();
    next[Networks.ergo] = createErgoNetwork();

    setNetworks(next);
  };

  return {
    networks,
    reload,
  };
};
