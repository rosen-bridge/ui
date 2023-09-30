import Nami from '@rosen-ui/nami-wallet';
import { Wallet } from '@rosen-ui/wallet-api';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';

/**
 * the main object for Cardano network
 * providing access to network info and wallets and network specific
 * functionality
 */

const CardanoNetwork: Network = {
  name: Networks.cardano,
  label: 'Cardano',
  availableWallets: [Nami as unknown as Wallet],
  logo: '/cardano.svg',
};

export default CardanoNetwork;
