import {
  BitcoinBoxSelection,
  generateFeeEstimator,
} from '@rosen-bridge/bitcoin-utxo-selection';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { Psbt, address, payments } from 'bitcoinjs-lib';

import {
  DOGE_NETWORK,
  DOGE_INPUT_SIZE,
  DOGE_TX_BASE_SIZE,
  DOGE_OUTPUT_SIZE,
} from './constants';
import { DogeUtxo, UnsignedPsbtData } from './types';
import {
  estimateTxWeight,
  getAddressUtxos,
  getFeeRatio,
  getMinimumMeaningfulDoge,
  getTxHex,
} from './utils';

const selector = new BitcoinBoxSelection();

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
    const utxos = await getAddressUtxos(fromAddress);
    const feeRatio = await getFeeRatio();
    const minDoge = getMinimumMeaningfulDoge(feeRatio);

    // generate fee estimator
    const estimateFee = generateFeeEstimator(
      1,
      DOGE_TX_BASE_SIZE,
      DOGE_INPUT_SIZE,
      DOGE_OUTPUT_SIZE,
      feeRatio,
      1, // the virtual size matters for fee estimation of native-segwit transactions
    );

    const coveredBoxes = await selector.getCoveringBoxes(
      {
        nativeToken: unwrappedAmount,
        tokens: [],
      },
      [],
      new Map<string, DogeUtxo | undefined>(),
      utxos.values(),
      minDoge,
      undefined,
      estimateFee,
    );
    if (!coveredBoxes.covered) {
      const totalInputDoge = utxos.reduce(
        (sum, walletUtxo) => sum + BigInt(walletUtxo.value),
        0n,
      );
      throw new Error(
        `Available boxes didn't cover required assets. DOGE: ${
          unwrappedAmount + minDoge
        }`,
        {
          cause: {
            totalInputDoge,
            fromAddress: fromAddress,
          },
        },
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
