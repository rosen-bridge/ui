import { WalletConnect } from '@rosen-ui/wallet-connect';

import { binance, ethereum } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

export const walletConnect = new WalletConnect({
  networks: [binance, ethereum],
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!,
  getTokenMap,
});
