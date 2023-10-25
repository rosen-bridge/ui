import namiWallet from '@rosen-ui/nami-wallet';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';

import { decodeWasmValue } from '@/_actions/cardanoDecoder';
import { Wallet } from '@rosen-ui/wallet-api';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { getDecimalString } from '@rosen-ui/utils';

/**
 * the main object for Cardano network
 * providing access to network info and wallets and network specific
 * functionality
 */
const CardanoNetwork: Network<Wallet> = {
  name: Networks.cardano,
  label: 'Cardano',
  availableWallets: [
    {
      ...namiWallet,
      getBalance: async (token: RosenChainToken) => {
        const context = await namiWallet.api.enable();
        const rawValue = await context.getBalance();
        const balances = await decodeWasmValue(rawValue);

        const amount = balances.find(
          (asset) => asset.policyId === token.policyId,
        );
        return amount
          ? Number(getDecimalString(amount.quantity.toString(), token.decimals))
          : 0;
      },
      transfer: async (...args) => {
        const context = await namiWallet.api.enable();
        throw new Error('NotImplemented');
      },
    },
  ],
  nextHeightInterval: 25,
  logo: '/cardano.svg',
  api: {
    explorerUrl: 'https://api.koios.rest/api',
    networkStatusUrl: 'https://api.koios.rest/api/v0/blocks?limit=1',
  },
  lockAddress: '',
};

export default CardanoNetwork;
