import getNautilusWallet, {
  isNautilusAvailable,
} from '@rosen-ui/nautilus-wallet';
import { compact } from 'lodash-es';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';
import { ErgoToken, Wallet } from '@rosen-ui/wallet-api';

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
const ErgoNetwork: Network<Wallet> = {
  name: Networks.ergo,
  label: 'Ergo',
  availableWallets: compact([
    isNautilusAvailable() && {
      ...getNautilusWallet(),
      getBalance: async (token) => {
        const context = await getNautilusWallet().api.getContext();
        const balance = await context.get_balance((token as ErgoToken).tokenId);
        return +balance;
      },
      transfer: async (...args) => {
        const context = await getNautilusWallet().api.getContext();
        throw new Error('NotImplemented');
      },
    },
  ]),
  logo: '/ergo.svg',
  nextHeightInterval: 5,
  api: {
    explorerUrl: 'https://api.ergoplatform.com/',
    networkStatusUrl: 'https://api.ergoplatform.com/api/v1/networkState',
  },
  lockAddress: '',
};

export default ErgoNetwork;
