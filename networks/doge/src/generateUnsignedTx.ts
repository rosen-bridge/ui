import { selectBitcoinUtxos } from '@rosen-bridge/bitcoin-utxo-selection';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { Psbt, address, payments } from 'bitcoinjs-lib';

import { DOGE_NETWORK, DOGE_INPUT_SIZE } from './constants';
import { DogeUtxo, UnsignedPsbtData } from './types';
import {
  estimateTxWeight,
  getAddressUtxos,
  getFeeRatio,
  getMinimumMeaningfulDoge,
  getTxHex,
} from './utils';

/**
 * generates doge lock tx
 * @param getTokenMap
 * @returns
 */
export const generateUnsignedTx =
  (getTokenMap: () => Promise<TokenMap>) =>
  async (
    lockAddress: string,
    fromAddress: string,
    wrappedAmount: RosenAmountValue,
    opReturnData: string,
    token: RosenChainToken,
  ): Promise<UnsignedPsbtData> => {
    const tokenMap = await getTokenMap();
    const unwrappedAmount = tokenMap.unwrapAmount(
      token.tokenId,
      wrappedAmount,
      NETWORKS.doge.key,
    ).amount;

    // generate txBuilder
    const psbt = new Psbt({ network: DOGE_NETWORK });

    // generate OP_RETURN box
    const opReturnPayment = payments.embed({
      data: [Buffer.from(opReturnData, 'hex')],
    });
    psbt.addOutput({
      script: opReturnPayment.output!,
      value: 0,
    });

    // generate lock box
    const lockScript = address.toOutputScript(lockAddress, DOGE_NETWORK);
    psbt.addOutput({
      script: lockScript,
      value: Number(unwrappedAmount),
    });

    // estimate tx weight without considering inputs
    //  0 inputs, 2 outputs, 1 for feeRatio to get weights only, multiply by 4 to convert vSize to weight unit
    let estimatedTxWeight = estimateTxWeight(0, 2, opReturnData.length);

    // fetch inputs
    const utxoIterator = (await getAddressUtxos(fromAddress)).values();
    const feeRatio = await getFeeRatio();
    const minDoge = getMinimumMeaningfulDoge(feeRatio);
    const coveredBoxes = await selectBitcoinUtxos(
      unwrappedAmount + minDoge,
      [],
      new Map<string, DogeUtxo | undefined>(),
      utxoIterator,
      minDoge,
      DOGE_INPUT_SIZE,
      estimatedTxWeight,
      feeRatio,
      undefined,
      1,
    );
    if (!coveredBoxes.covered) {
      throw new Error(
        `Available boxes didn't cover required assets. DOGE: ${
          unwrappedAmount + minDoge
        }`,
      );
    }

    // add inputs
    const fromAddressScript = address.toOutputScript(fromAddress, DOGE_NETWORK);
    const txToHex: Record<string, string> = {};
    for (const box of coveredBoxes.boxes) {
      if (!txToHex[box.txId]) {
        const boxTxHex = await getTxHex(box.txId);
        txToHex[box.txId] = boxTxHex;
      }
      psbt.addInput({
        hash: box.txId,
        index: box.index,
        nonWitnessUtxo: Buffer.from(txToHex[box.txId], 'hex'),
        redeemScript: fromAddressScript,
      });
    }

    // calculate input boxes assets
    let remainingDoge =
      coveredBoxes.boxes.reduce((a, b) => a + b.value, 0n) - unwrappedAmount;

    // create change output
    estimatedTxWeight = estimateTxWeight(
      psbt.txInputs.length,
      2,
      opReturnData.length,
    );

    const estimatedFee = BigInt(Math.ceil(estimatedTxWeight * feeRatio));
    remainingDoge -= estimatedFee;
    psbt.addOutput({
      script: fromAddressScript,
      value: Number(remainingDoge),
    });

    return {
      psbt: {
        base64: psbt.toBase64(),
        hex: psbt.toHex(),
      },
      inputSize: psbt.inputCount,
    };
  };
