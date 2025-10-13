import * as runelib from '@magiceden-oss/runestone-lib';
import {
  BitcoinRunesBoxSelection,
  BitcoinRunesUtxo,
} from '@rosen-bridge/bitcoin-runes-utxo-selection';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import * as bitcoinJs from 'bitcoinjs-lib';

import { MINIMUM_BTC_FOR_NATIVE_SEGWIT_OUTPUT } from './constants';
import { AssetBalance, UnsignedPsbtData } from './types';
import {
  collect,
  getAdditionalBoxes,
  getAddressAvailableBtcUtxos,
  getAddressRunesUtxos,
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

    // generate iterator for address boxes
    const runesUtxos = await collect(
      getAddressRunesUtxos(fromAddress, token.tokenId),
    );

    const boxSelection = new BitcoinRunesBoxSelection();

    const coveredRunesBoxes = await boxSelection.getCoveringBoxes(
      {
        nativeToken: 0n,
        tokens: requiredAssets.tokens,
      },
      [],
      new Map(),
      runesUtxos.values(),
      0n,
      undefined,
      () => 0n,
    );
    if (!coveredRunesBoxes.covered) {
      throw new Error(
        `Available boxes didn't cover required Runes. Required Runes: ${JsonBigInt.stringify(
          requiredAssets.tokens,
        )}`,
      );
    }

    const selectedBoxes: BitcoinRunesUtxo[] = coveredRunesBoxes.boxes;

    const additionalAssets = coveredRunesBoxes.additionalAssets.aggregated;
    additionalAssets.nativeToken -= requiredAssets.nativeToken;
    let estimatedFee = coveredRunesBoxes.additionalAssets.fee;

    let preSelectedBtc = selectedBoxes.reduce((a, b) => a + b.value, 0n);

    if (preSelectedBtc < requiredAssets.nativeToken + estimatedFee) {
      const requiredBtc = requiredAssets.nativeToken - preSelectedBtc;

      // get available btc utxos
      const btcUtxos = await collect(getAddressAvailableBtcUtxos(fromAddress));

      const additionalBoxes = await getAdditionalBoxes(
        requiredBtc,
        selectedBoxes,
        btcUtxos,
        feeRatio,
        runestone.encodedRunestone.length,
        lockDataChunks.length,
      );

      // add selected boxes
      selectedBoxes.push(...additionalBoxes.boxes);
      // the fee and additional BTC are only based on the additional assets of the 2nd selection
      additionalAssets.nativeToken =
        additionalBoxes.additionalAssets.aggregated.nativeToken;
      estimatedFee = additionalBoxes.additionalAssets.fee;
    }

    preSelectedBtc = selectedBoxes.reduce((a, b) => a + b.value, 0n);
    if (preSelectedBtc < requiredAssets.nativeToken + estimatedFee) {
      const requiredBtc = requiredAssets.nativeToken - preSelectedBtc;

      // get all utxos
      const utxos = await getAddressUtxos(fromAddress, runesUtxos);

      const additionalBoxes = await getAdditionalBoxes(
        requiredBtc,
        selectedBoxes,
        utxos,
        feeRatio,
        runestone.encodedRunestone.length,
        lockDataChunks.length,
      );

      if (!additionalBoxes.covered) {
        throw new Error(
          `Boxes didn't cover required BTC. Required BTC: ${requiredBtc}`,
        );
      }

      // add selected boxes
      selectedBoxes.push(...additionalBoxes.boxes);
      // the fee and additional BTC are only based on the additional assets of the 2nd selection
      additionalAssets.nativeToken =
        additionalBoxes.additionalAssets.aggregated.nativeToken;
      estimatedFee = additionalBoxes.additionalAssets.fee;
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
      value: Number(additionalAssets.nativeToken),
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
