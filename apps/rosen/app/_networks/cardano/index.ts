import { Networks } from '@rosen-ui/constants';

import { unwrap } from '@/_errors';
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
import { fromSafeData } from '@/_utils/safeData';

const config = {
  getTokenMap,
  decodeWasmValue: unwrap(fromSafeData(decodeWasmValue)),
  generateLockAuxiliaryData: unwrap(fromSafeData(generateLockAuxiliaryData)),
  generateUnsignedTx: unwrap(fromSafeData(generateUnsignedTx)),
  setTxWitnessSet: unwrap(fromSafeData(setTxWitnessSet)),
};

/**
 * the main object for Cardano network
 * providing access to network info and wallets and network specific
 * functionality
 */
const CardanoNetwork: CardanoNetworkType = {
  name: Networks.CARDANO,
  label: 'Cardano',
  wallets: [
    eternlWalletCreator(config),
    flintWalletCreator(config),
    laceWalletCreator(config),
    namiWalletCreator(config),
  ],
  nextHeightInterval: 25,
  logo: CardanoIcon,
  lockAddress: process.env.NEXT_PUBLIC_CARDANO_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(fromSafeData(getMaxTransfer)),
  toSafeAddress: (address) => address,
};

export default CardanoNetwork;
