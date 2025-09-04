import * as runelib from '@magiceden-oss/runestone-lib';
import {
  BitcoinRunesBoxSelection,
  BitcoinRunesUtxo,
} from '@rosen-bridge/bitcoin-runes-utxo-selection';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import bitcoinJs from 'bitcoinjs-lib';

import {
  GET_BOX_API_LIMIT,
  MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT,
  MINIMUM_BTC_FOR_TAPROOT_OUTPUT,
} from './constants';
import { AssetBalance, UnsignedPsbtData } from './types';
import {
  generateFeeEstimatorWithAssumptions,
  getAddressBtcBoxes,
  getAddressRunesBoxes,
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
      0,
      lockDataChunks.length + 1, // multiple utxos for data chunks, 1 utxo to lock address
      0,
    );

    // fetch input boxes
    const boxSelection = new BitcoinRunesBoxSelection();

    // generate iterator for address boxes
    const runesUtxoIterator = async function* () {
      let offset = 0;
      const limit = GET_BOX_API_LIMIT;
      while (true) {
        const page = await getAddressRunesBoxes(
          fromAddress,
          token.tokenId,
          offset,
          limit,
        );
        if (page.length === 0) break;
        yield* page;
        offset += limit;
      }
      return undefined;
    };

    const selectedBoxes: BitcoinRunesUtxo[] = [];

    const coveredRunesBoxes = await boxSelection.getCoveringBoxes(
      {
        nativeToken: 0n,
        tokens: requiredAssets.tokens,
      },
      [],
      new Map(),
      runesUtxoIterator(),
      MINIMUM_BTC_FOR_TAPROOT_OUTPUT,
      undefined,
      estimateFee,
    );
    if (!coveredRunesBoxes.covered) {
      throw new Error(
        `Available boxes didn't cover required assets. Required assets: ${JsonBigInt.stringify(
          requiredAssets,
        )}`,
      );
    }
    selectedBoxes.push(...coveredRunesBoxes.boxes);
    const preSelectedBtc = coveredRunesBoxes.boxes.reduce(
      (a, b) => a + b.value,
      0n,
    );

    const additionalAssets = coveredRunesBoxes.additionalAssets.aggregated;
    let estimatedFee = coveredRunesBoxes.additionalAssets.fee;

    if (preSelectedBtc < requiredAssets.nativeToken + estimatedFee) {
      const requiredBtc = requiredAssets.nativeToken - preSelectedBtc;

      // generate fee estimator for 2nd box selection
      const feeEstimator = generateFeeEstimatorWithAssumptions(
        runestone.encodedRunestone.length,
        feeRatio,
        selectedBoxes.length,
        lockDataChunks.length + 1, // multiple utxos for data chunks, 1 utxo to lock address
        0,
      );

      // generate iterator for address boxes to cover required btc
      const btcUtxoIterator = (await getAddressBtcBoxes(lockAddress)).values();

      // fetch input boxes to cover required BTC
      const coveredBtcBoxes = await boxSelection.getCoveringBoxes(
        { nativeToken: requiredBtc, tokens: [] },
        [],
        new Map(),
        btcUtxoIterator,
        MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT,
        undefined,
        feeEstimator,
      );
      if (!coveredBtcBoxes.covered) {
        throw new Error(
          `Available boxes didn't cover required assets. Required assets: ${JsonBigInt.stringify(
            requiredAssets,
          )}`,
        );
      }
      // add selected boxes
      selectedBoxes.push(...coveredBtcBoxes.boxes);
      // the fee and additional BTC are only based on the additional assets of the 2nd selection
      additionalAssets.nativeToken =
        coveredBtcBoxes.additionalAssets.aggregated.nativeToken;
      estimatedFee = coveredBtcBoxes.additionalAssets.fee;
    }

    const taprootPayment = bitcoinJs.payments.p2tr({
      internalPubkey: Buffer.from(internalPubkey, 'hex'),
    });

    if (!taprootPayment.output)
      throw Error(`failed to extract taproot output script!`);
    if (!taprootPayment.address)
      throw Error(`failed to extract taproot address!`);
    if (taprootPayment.address !== fromAddress)
      throw Error(
        `the calculated address by public key is not equal to from address!`,
      );

    let psbt = new bitcoinJs.Psbt();

    // add inputs
    for (const box of selectedBoxes) {
      psbt.addInput({
        hash: box.txId,
        index: box.index,
        witnessUtxo: {
          script: taprootPayment.output,
          value: Number(box.value),
        },
        tapInternalKey: taprootPayment.internalPubkey,
      });
    }

    // add change UTxO
    psbt.addOutput({
      script: taprootPayment.output,
      value: Number(additionalAssets.nativeToken - requiredAssets.nativeToken),
    });
    // OP_RETURN
    psbt.addOutput({
      script: runestone.encodedRunestone,
      value: 0,
    });
    // lock UTxO
    psbt.addOutput({
      script: bitcoinJs.address.toOutputScript(lockAddress),
      value: Number(MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT),
    });
    // lock data UTxOs
    lockDataChunks.forEach((chunk, index) => {
      psbt.addOutput({
        script: Buffer.from(`0014${chunk.padEnd(40, '0')}`, 'hex'),
        value: Number(MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT) + index,
      });
    });

    return {
      psbt: {
        base64: psbt.toBase64(),
        hex: psbt.toHex(),
      },
      inputSize: psbt.inputCount,
    };
  };
