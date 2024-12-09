import { CardanoIcon } from '@rosen-bridge/icons';
import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';
import { EtrnlWallet } from '@rosen-ui/eternl-wallet';
import { FlintWallet } from '@rosen-ui/flint-wallet';
import { LaceWallet } from '@rosen-ui/lace-wallet';
import { namiWalletCreator } from '@rosen-ui/nami-wallet';

import { unwrap } from '@/_safeServerAction';
import { getTokenMap } from '@/_tokenMap/getClientTokenMap';
import { CardanoNetwork as CardanoNetworkType } from '@/_types';

import { createWallet } from '../createWallet';
import { getMaxTransfer } from './getMaxTransfer';
import {
  decodeWasmValue,
  generateLockAuxiliaryData,
  generateUnsignedTx,
  setTxWitnessSet,
} from './server';

const config = {
  getTokenMap,
  decodeWasmValue: unwrap(decodeWasmValue),
  generateLockAuxiliaryData: unwrap(generateLockAuxiliaryData),
  generateUnsignedTx: unwrap(generateUnsignedTx),
  setTxWitnessSet: unwrap(setTxWitnessSet),
};

/**
 * the main object for Cardano network
 * providing access to network info and wallets and network specific
 * functionality
 */
export const CardanoNetwork: CardanoNetworkType = {
  name: NETWORKS.CARDANO,
  label: NETWORK_LABELS.CARDANO,
  wallets: [
    createWallet(new EtrnlWallet(config)),
    createWallet(new FlintWallet(config)),
    createWallet(new LaceWallet(config)),
    namiWalletCreator(config),
  ],
  nextHeightInterval: 25,
  logo: CardanoIcon,
  lockAddress: process.env.NEXT_PUBLIC_CARDANO_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address,
};
