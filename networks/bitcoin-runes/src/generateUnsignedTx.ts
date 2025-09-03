import * as runelib from '@magiceden-oss/runestone-lib';
import { BitcoinRunesBoxSelection } from '@rosen-bridge/bitcoin-runes-utxo-selection';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import bitcoinJs from 'bitcoinjs-lib';

import {
  MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT,
  MINIMUM_BTC_FOR_TAPROOT_OUTPUT,
} from './constants';
import { AssetBalance, UnsignedPsbtData } from './types';
import {
  generateFeeEstimatorWithAssumptions,
  getAddressUtxos,
  getFeeRatio,
} from './utils';

/**
 * generates bitcoin-runes lock tx
 * @param getTokenMap
 * @returns
 */
export const generateUnsignedTx =
  (getTokenMap: () => Promise<TokenMap>) =>
  async (
    lockAddress: string,
    fromAddress: string,
    wrappedAmount: RosenAmountValue,
    lockData: string,
    token: RosenChainToken,
    internalPubkey: string,
  ): Promise<UnsignedPsbtData> => {
    const tokenMap = await getTokenMap();

    const lockDataChunks = lockData.match(/.{1,40}/g);
    if (!lockDataChunks)
      throw Error(`Failed to split lock data [${lockData}] into chunks`);

    // each data utxo has 1 additional satoshi (294, 295, 296, ...)
    const requiredSatoshiForLockData =
      MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT * BigInt(lockDataChunks.length) +
      BigInt(
        Math.ceil((lockDataChunks.length * (lockDataChunks.length - 1)) / 2),
      );

    const requiredAssets: AssetBalance = {
      nativeToken:
        MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT + requiredSatoshiForLockData,
      tokens: [
        {
          id: token.tokenId,
          value: tokenMap.unwrapAmount(
            token.tokenId,
            wrappedAmount,
            NETWORKS['bitcoin-runes'].key,
          ).amount,
        },
      ],
    };

    // generate Runestone
    // add runes transfer to edicts list
    const [blockId, txIndex] = token.tokenId.split(':');
    const tokenIdObj = {
      block: BigInt(blockId),
      tx: Number(txIndex),
    };

    // generate runes data
    // add OP_RETURN output
    const runestone = runelib.encodeRunestone({
      edicts: [
        {
          id: tokenIdObj,
          amount: requiredAssets.tokens[0].value,
          output: 2,
        },
      ],
      pointer: 0,
    });

    // generate fee estimator
    const feeRatio = await getFeeRatio();

    const estimateFee = generateFeeEstimatorWithAssumptions(
      runestone.encodedRunestone.length,
      feeRatio,
      5,
      0,
    );

    // fetch input boxes
    const boxSelection = new BitcoinRunesBoxSelection();

    // generate iterator for address boxes
    const utxoIterator = (await getAddressUtxos(fromAddress)).values();

    const coveredBoxes = await boxSelection.getCoveringBoxes(
      requiredAssets,
      [],
      new Map(),
      utxoIterator,
      MINIMUM_BTC_FOR_TAPROOT_OUTPUT,
      undefined,
      estimateFee,
    );
    if (!coveredBoxes.covered) {
      throw new Error(
        `Available boxes didn't cover required assets. Required assets: ${JsonBigInt.stringify(
          requiredAssets,
        )}`,
      );
    }

    const lockScript = bitcoinJs.address.toOutputScript(lockAddress);

    const taprootPayment = bitcoinJs.payments.p2tr({
      internalPubkey: Buffer.from(internalPubkey, 'hex'),
    });

    if (!taprootPayment.output)
      throw Error(`failed to extract taproot output script!`);
    if (!taprootPayment.address || taprootPayment.address !== fromAddress)
      throw Error(`failed to extract taproot address!`);

    const outputs: Array<Parameters<typeof psbt.addOutput>[0]> = [];

    let psbt = new bitcoinJs.Psbt();

    // add inputs
    const additionalAssets = coveredBoxes.additionalAssets.aggregated;
    coveredBoxes.boxes.forEach((box) => {
      psbt.addInput({
        hash: box.txId,
        index: box.index,
        witnessUtxo: {
          script: taprootPayment.output!,
          value: Number(box.value),
        },
        tapInternalKey: taprootPayment.internalPubkey,
      });
    });
    // OP_RETURN
    outputs.push({
      script: runestone.encodedRunestone,
      value: 0,
    });
    // lock UTxO
    outputs.push({
      script: lockScript,
      value: Number(MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT),
    });
    // lock data UTxOs
    lockDataChunks.forEach((chunk, index) => {
      outputs.push({
        script: Buffer.from(`0014${chunk.padEnd(40, '0')}`, 'hex'),
        value: Number(MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT) + index,
      });
    });

    // calculate fee and remaining BTC
    const estimatedFee = coveredBoxes.additionalAssets.fee;
    const fee = estimateFee(coveredBoxes.boxes, 0);
    const remainingBtc = additionalAssets.nativeToken + estimatedFee - fee;
    if (remainingBtc <= MINIMUM_BTC_FOR_TAPROOT_OUTPUT)
      throw new Error(
        `ImpossibleBehavior: Remaining BTC does not reach minimum UTxO value [${remainingBtc} < ${MINIMUM_BTC_FOR_TAPROOT_OUTPUT}] while utxo selection covered`,
      );

    // add change UTxO
    psbt.addOutput({
      script: taprootPayment.output,
      value: Number(remainingBtc),
    });
    // add outputs
    outputs.forEach(psbt.addOutput);

    return {
      psbt: {
        base64: psbt.toBase64(),
        hex: psbt.toHex(),
      },
      inputSize: psbt.inputCount,
    };
  };
