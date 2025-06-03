import { MetaMaskWallet } from '@rosen-ui/metamask-wallet';

import { binance, ethereum } from '@/_networks';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';

export const metaMask = new MetaMaskWallet({
  networks: [binance, ethereum],
  getTokenMap,
});
