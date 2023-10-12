import Nautilus from '@rosen-ui/nautilus-wallet';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
const ErgoNetwork: Network = {
  name: Networks.ergo,
  label: 'Ergo',
  availableWallets: [Nautilus],
  logo: '/ergo.svg',
  nextHeightInterval: 5,
  api: {
    explorerUrl: 'https://api.ergoplatform.com/',
    networkStatusUrl: 'https://api.ergoplatform.com/api/v1/networkState',
  },
};

export default ErgoNetwork;
