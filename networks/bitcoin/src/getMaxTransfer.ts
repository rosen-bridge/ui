import { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import {
  estimateTxWeight,
  generateOpReturnData,
  getFeeRatio,
  getAddressUtxos,
  getMinimumMeaningfulSatoshi,
} from './utils';

export const getMaxTransferCreator =
  (getTokenMap: () => Promise<TokenMap>) =>
  async ({
    balance,
    isNative,
    eventData,
  }: {
    balance: RosenAmountValue;
    isNative: boolean;
    eventData: {
      toChain: Network;
      fromAddress: string;
      toAddress: string;
    };
  }) => {
    const tokenMap = await getTokenMap();
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

    const offset = tokenMap.wrapAmount(
      NETWORKS.bitcoin.nativeToken,
      BigInt(estimatedFee) + minSatoshi,
      NETWORKS.bitcoin.key,
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
  };
