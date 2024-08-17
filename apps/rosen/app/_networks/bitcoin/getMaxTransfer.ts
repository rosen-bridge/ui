'use server';

import {
  estimateTxWeight,
  generateOpReturnData,
  getFeeRatio,
  getAddressUtxos,
  getMinimumMeaningfulSatoshi,
} from '@rosen-network/bitcoin';

import { wrap } from '@/_errors';
import { BitcoinNetwork } from '@/_types/network';
import { Networks } from '@rosen-ui/constants';
import { getTokenMap } from '../getTokenMap.server';
import { RosenAmountValue } from '@rosen-ui/types';

/**
 * get max transfer for bitcoin
 */
export const getMaxTransfer = wrap(
  async ({
    balance,
    isNative,
    eventData,
  }: Parameters<
    BitcoinNetwork['getMaxTransfer']
  >[0]): Promise<RosenAmountValue> => {
    if (!eventData.toAddress) return 0n;

    const feeRatio = await getFeeRatio();
    const opRetrunDataLength = (
      await generateOpReturnData(
        eventData.toChain,
        eventData.toAddress,
        // We don't care about the actual op return data and only need the length
        '0',
        '0',
      )
    ).length;
    const utxos = await getAddressUtxos(eventData.fromAddress);
    const estimatedTxWeight = await estimateTxWeight(
      /**
       * When getting max transfer, probably all of the utxos are going to be
       * spent
       */
      utxos.length,
      2,
      opRetrunDataLength,
    );
    const estimatedFee = Math.ceil((estimatedTxWeight / 4) * feeRatio);
    const minSatoshi = await getMinimumMeaningfulSatoshi(feeRatio);

    const tokenMap = await getTokenMap();

    const offset = tokenMap.wrapAmount(
      'btc',
      BigInt(estimatedFee) + minSatoshi,
      Networks.BITCOIN,
    ).amount;

    return balance < 0n || !isNative
      ? 0n
      : /**
         * We need to subtract (utxos.length + 1) from the calculated value because
         * of a bug in bitcoin box selection
         *
         * local:ergo/rosen-bridge/utils#204
         */
        balance - offset - BigInt(utxos.length + 1);
  },
);
