import { WalletConnect } from '@rosen-ui/wallet-connect';

import { binance, ethereum } from '@/networks';
import { getTokenMap } from '@/tokenMap/getClientTokenMap';

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  throw new Error(
    'Missing required environment variable: NEXT_PUBLIC_REOWN_PROJECT_ID',
  );
}

export const walletConnect = new WalletConnect({
  networks: [binance, ethereum],
  projectId,
  getTokenMap,
});
