import { useState } from 'react';

import { Nami, Nautilus } from '@/_wallets';

import { Chains } from '@/_constants';

const ergoWallet = new Nautilus();
const cardanoWallet = new Nami();

const useWallet = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const connectToWallet = async (sourceChain: keyof typeof Chains) => {
    if (sourceChain === Chains.ergo) {
      const connected = await ergoWallet.connect();
      if (connected) {
        return 0;
      } else {
        return 1;
      }
    } else if (sourceChain === Chains.cardano) {
      const connected = await cardanoWallet.connect();
      if (connected) {
        return 0;
      } else {
        return 1;
      }
    } else {
      return -1;
    }
  };
  return {
    connectToWallet,
  };
};

export default useWallet;
