import Nami from '@rosen-ui/nami-wallet';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';

import {
  decodeWasmValue,
  decodeWasmAddress,
  decodeWasmUtxos,
} from '@/_actions/cardanoDecoder';
import { CardanoWallet } from '@rosen-ui/wallet-api';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { getDecimalString } from '@rosen-ui/utils';

/**
 * the main object for Cardano network
 * providing access to network info and wallets and network specific
 * functionality
 */
const CardanoNetwork: Network<CardanoWallet> = {
  name: Networks.cardano,
  label: 'Cardano',
  availableWallets: [
    {
      ...Nami,
      getBalance: async (token: RosenChainToken) => {
        const rawValue = await Nami.getBalance(token);
        const balances = await decodeWasmValue(rawValue);

        const amount = balances.find(
          (asset) => asset.policyId === token.policyId,
        );
        return amount
          ? Number(getDecimalString(amount.quantity.toString(), token.decimals))
          : 0;
      },
      getChangeAddress: async () => {
        const rawAddresses = await Nami.getChangeAddress();
        return await decodeWasmAddress(rawAddresses);
      },
      getUtxos: async () => {
        const rawUtxo = await Nami.getUtxos();
        const promiseList = rawUtxo.map(
          async (utxo) => await decodeWasmUtxos(utxo),
        );
        return await Promise.all(promiseList);
      },
    },
  ],
  nextHeightInterval: 25,
  logo: '/cardano.svg',
  api: {
    explorerUrl: 'https://api.koios.rest/api',
    networkStatusUrl: 'https://api.koios.rest/api/v0/blocks?limit=1',
  },
};

export default CardanoNetwork;
