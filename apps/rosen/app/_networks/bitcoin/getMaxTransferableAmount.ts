'use server';

import { BitcoinNetwork } from '@/_types/network';
import {
  generateOpReturnData,
  estimateTxWeight,
  getFeeRatio,
  getAddressUtxos,
  getMinimumMeaningfulSatoshi,
} from '@rosen-ui/xdefi-wallet/dist/src/utils';

/**
 * get max transfer for bitcoin
 */
const getMaxTransferableAmount = async ({
  balance,
  isNative,
  eventData,
}: Parameters<BitcoinNetwork['getMaxTransferableAmount']>[0]) => {
  if (!eventData.toAddress) return 0;

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

  return balance < 0 || !isNative
    ? 0
    : /**
       * We need to subtract (utxos.length + 1) from the calculated value because
       * of a bug in bitcoin box selection
       *
       * local:ergo/rosen-bridge/utils#204
       */
      balance - estimatedFee - Number(minSatoshi) - utxos.length - 1;
};

export default getMaxTransferableAmount;
