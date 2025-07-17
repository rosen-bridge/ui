import { MetaMaskWallet } from '@rosen-ui/metamask-wallet';

import { binance, ethereum } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const metaMask = new MetaMaskWallet({
  networks: [binance, ethereum],
  getTokenMap,
});
