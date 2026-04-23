import { MetaMaskWallet } from '@rosen-ui/metamask-wallet';

import { base, binance, ethereum } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const metaMask = new MetaMaskWallet({
  networks: [base, binance, ethereum],
  getTokenMap,
});
