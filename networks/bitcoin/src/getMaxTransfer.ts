import { TokenMap } from '@rosen-bridge/tokens';
import { NATIVE_TOKENS, NETWORKS } from '@rosen-ui/constants';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import {
  estimateTxWeight,
  generateOpReturnData,
  getFeeRatio,
  getAddressUtxos,
  getMinimumMeaningfulSatoshi,
} from './utils';

export const getMaxTransferCreator =
  (tokenMap: TokenMap) =>
  async ({
    balance,
    isNative,
    eventData,
  }: {
    balance: RosenAmountValue;
    isNative: boolean;
    eventData: () => Promise<{
      toChain: Network;
      fromAddress: string;
      toAddress: string;
    }>;
  }) => {
    const data = await eventData();

    if (!data.toAddress) return 0n;

    const feeRatio = await getFeeRatio();
    const opRetrunDataLength = (
      await generateOpReturnData(
        data.toChain,
        data.toAddress,
        // We don't care about the actual op return data and only need the length
        '0',
        '0',
      )
    ).length;
    const utxos = await getAddressUtxos(data.fromAddress);
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
      NATIVE_TOKENS.BITCOIN,
      BigInt(estimatedFee) + minSatoshi,
      NETWORKS.BITCOIN,
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
