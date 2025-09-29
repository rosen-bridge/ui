import {
  BitcoinBoxSelection,
  generateFeeEstimator,
} from '@rosen-bridge/bitcoin-utxo-selection';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { Psbt, address, payments } from 'bitcoinjs-lib';

import {
  SEGWIT_INPUT_WEIGHT_UNIT,
  SEGWIT_OUTPUT_WEIGHT_UNIT,
} from './constants';
import { BitcoinUtxo, UnsignedPsbtData } from './types';
import {
  estimateTxWeight,
  getAddressUtxos,
  getFeeRatio,
  getMinimumMeaningfulSatoshi,
} from './utils';

const selector = new BitcoinBoxSelection();

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
    const utxos = await getAddressUtxos(fromAddress);
    const feeRatio = await getFeeRatio();
    const minSatoshi = getMinimumMeaningfulSatoshi(feeRatio);

    // generate fee estimator
    const estimateFee = generateFeeEstimator(
      1,
      42, // all txs include 40W. P2WPKH txs need additional 2W
      SEGWIT_INPUT_WEIGHT_UNIT,
      SEGWIT_OUTPUT_WEIGHT_UNIT,
      feeRatio,
      4, // the virtual size matters for fee estimation of native-segwit transactions
    );

    const coveredBoxes = await selector.getCoveringBoxes(
      {
        nativeToken: unwrappedAmount,
        tokens: [],
      },
      [],
      new Map<string, BitcoinUtxo | undefined>(),
      utxos.values(),
      minSatoshi,
      undefined,
      estimateFee,
    );
    if (!coveredBoxes.covered) {
      const totalInputBtc = utxos.reduce(
        (sum, walletUtxo) => sum + BigInt(walletUtxo.value),
        0n,
      );
      throw new Error(
        `Available boxes didn't cover required assets. BTC: ${
          unwrappedAmount + minSatoshi
        }`,
        {
          cause: {
            totalInputBtc,
            fromAddress: fromAddress,
          },
        },
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
