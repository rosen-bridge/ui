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

    // fetch inputs
    const utxos = await getAddressUtxos(fromAddress);
    const feeRatio = await getFeeRatio();
    const minSatoshi = getMinimumMeaningfulSatoshi(feeRatio);

    // generate fee estimator
    const estimateFee = generateFeeEstimator(
      0,
      42 + // all txs include 40W. P2WPKH txs need additional 2W
        44 + // OP_RETURN output base weight
        opReturnData.length * 2, // op_return data weight
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

    // add change
    psbt.addOutput({
      script: fromAddressScript,
      value: Number(coveredBoxes.additionalAssets.aggregated.nativeToken),
    });

    return {
      psbt: {
        base64: psbt.toBase64(),
        hex: psbt.toHex(),
      },
      inputSize: psbt.inputCount,
    };
  };
