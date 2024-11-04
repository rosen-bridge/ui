import { NETWORK_LABELS, NETWORKS } from '@rosen-ui/constants';

import { unwrap } from '@/_safeServerAction';
import { CardanoNetwork as CardanoNetworkType } from '@/_types/network';

import { CardanoIcon } from '@rosen-bridge/icons';

import { eternlWalletCreator } from '@rosen-ui/eternl-wallet';
import { flintWalletCreator } from '@rosen-ui/flint-wallet';
import { laceWalletCreator } from '@rosen-ui/lace-wallet';
import { namiWalletCreator } from '@rosen-ui/nami-wallet';

import {
  decodeWasmValue,
  generateLockAuxiliaryData,
  generateUnsignedTx,
  setTxWitnessSet,
} from './server';

import { getTokenMap } from '../getTokenMap.client';
import { getMaxTransfer } from './getMaxTransfer';

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
const CardanoNetwork: CardanoNetworkType = {
  name: NETWORKS.CARDANO,
  label: NETWORK_LABELS.CARDANO,
  wallets: [
    eternlWalletCreator(config),
    flintWalletCreator(config),
    laceWalletCreator(config),
    namiWalletCreator(config),
  ],
  nextHeightInterval: 25,
  logo: CardanoIcon,
  lockAddress: process.env.NEXT_PUBLIC_CARDANO_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(getMaxTransfer),
  toSafeAddress: (address) => address,
};

export default CardanoNetwork;
