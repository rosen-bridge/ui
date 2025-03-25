import { selectBitcoinUtxos } from '@rosen-bridge/bitcoin-utxo-selection';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { Psbt, address, payments } from 'bitcoinjs-lib';

import { SEGWIT_INPUT_WEIGHT_UNIT } from './constants';
import { BitcoinUtxo, UnsignedPsbtData } from './types';
import {
  estimateTxWeight,
  getAddressUtxos,
  getFeeRatio,
  getMinimumMeaningfulSatoshi,
} from './utils';

/**
 * generates bitcoin lock tx
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
      NETWORKS.bitcoin.key,
    ).amount;

    // generate txBuilder
    const psbt = new Psbt();

    // generate OP_RETURN box
    const opReturnPayment = payments.embed({
      data: [Buffer.from(opReturnData, 'hex')],
    });
    psbt.addOutput({
      script: opReturnPayment.output!,
      value: 0,
    });

    // generate lock box
    const lockPayment = payments.p2wpkh({
      address: lockAddress,
    });
    psbt.addOutput({
      script: lockPayment.output!,
      value: Number(unwrappedAmount),
    });

    // estimate tx weight without considering inputs
    //  0 inputs, 2 outputs, 1 for feeRatio to get weights only, multiply by 4 to convert vSize to weight unit
    let estimatedTxWeight = estimateTxWeight(0, 2, opReturnData.length);

    // fetch inputs
    const utxoIterator = (await getAddressUtxos(fromAddress)).values();
    const feeRatio = await getFeeRatio();
    const minSatoshi = getMinimumMeaningfulSatoshi(feeRatio);
    const coveredBoxes = await selectBitcoinUtxos(
      unwrappedAmount + minSatoshi,
      [],
      new Map<string, BitcoinUtxo | undefined>(),
      utxoIterator,
      minSatoshi,
      SEGWIT_INPUT_WEIGHT_UNIT,
      estimatedTxWeight,
      feeRatio,
    );
    if (!coveredBoxes.covered) {
      throw new Error(
        `Available boxes didn't cover required assets. BTC: ${
          unwrappedAmount + minSatoshi
        }`,
      );
    }

    // add inputs
    const fromAddressScript = address.toOutputScript(fromAddress);
    coveredBoxes.boxes.forEach((box) => {
      psbt.addInput({
        hash: box.txId,
        index: box.index,
        witnessUtxo: {
          script: fromAddressScript,
          value: Number(box.value),
        },
      });
    });

    // calculate input boxes assets
    let remainingBtc =
      coveredBoxes.boxes.reduce((a, b) => a + b.value, 0n) - unwrappedAmount;

    // create change output
    estimatedTxWeight = estimateTxWeight(
      psbt.txInputs.length,
      2,
      opReturnData.length,
    );
    const estimatedFee = BigInt(
      Math.ceil(
        (estimatedTxWeight / 4) * // estimate tx weight and convert to virtual size
          feeRatio,
      ),
    );
    remainingBtc -= estimatedFee;
    psbt.addOutput({
      script: fromAddressScript,
      value: Number(remainingBtc),
    });

    return {
      psbt: {
        base64: psbt.toBase64(),
        hex: psbt.toHex(),
      },
      inputSize: psbt.inputCount,
    };
  };
