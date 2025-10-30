import {
  BitcoinBoxSelection,
  generateFeeEstimator,
} from '@rosen-bridge/bitcoin-utxo-selection';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { MTX, Address, Coin, Covenant, Output } from 'hsd';

import {
  SEGWIT_INPUT_WEIGHT_UNIT,
  SEGWIT_OUTPUT_WEIGHT_UNIT,
} from './constants';
import { HandshakeUtxo, UnsignedMtxData } from './types';
import {
  getAddressUtxos,
  getFeeRatio,
  getMinimumMeaningfulSatoshi,
} from './utils';

const selector = new BitcoinBoxSelection();

/**
 * generates handshake lock tx using hsd library
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
  ): Promise<UnsignedMtxData> => {
    const tokenMap = await getTokenMap();
    const unwrappedAmount = tokenMap.unwrapAmount(
      token.tokenId,
      wrappedAmount,
      NETWORKS.handshake.key,
    ).amount;

    // create MTX (Mutable Transaction)
    const mtx = new MTX();

    // add OP_RETURN output (covenant type 0 with null data)
    const opReturnCovenant = Covenant.fromNullData(
      Buffer.from(opReturnData, 'hex'),
    );
    const opReturnOutput = new Output();
    opReturnOutput.value = 0;
    opReturnOutput.covenant = opReturnCovenant;
    mtx.outputs.push(opReturnOutput);

    // add lock output
    const lockAddr = Address.fromString(lockAddress);
    mtx.addOutput({
      address: lockAddr,
      value: Number(unwrappedAmount),
    });

    // fetch inputs
    const utxos = await getAddressUtxos(fromAddress);
    const feeRatio = await getFeeRatio();
    const minSatoshi = getMinimumMeaningfulSatoshi(feeRatio);

    // generate fee estimator
    const estimateFee = generateFeeEstimator(
      1,
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
      new Map<string, HandshakeUtxo | undefined>(),
      utxos.values(),
      minSatoshi,
      undefined,
      estimateFee,
    );
    if (!coveredBoxes.covered) {
      const totalInputHns = utxos.reduce(
        (sum, walletUtxo) => sum + BigInt(walletUtxo.value),
        0n,
      );
      throw new Error(
        `Available boxes didn't cover required assets. HNS: ${
          unwrappedAmount + minSatoshi
        }`,
        {
          cause: {
            totalInputHns,
            fromAddress: fromAddress,
          },
        },
      );
    }

    // add inputs as Coin objects
    const fromAddr = Address.fromString(fromAddress);
    coveredBoxes.boxes.forEach((box) => {
      const coin = Coin.fromJSON({
        version: 0,
        height: -1,
        value: Number(box.value),
        address: fromAddress,
        coinbase: false,
        hash: box.txId,
        index: box.index,
      });
      mtx.addCoin(coin);
    });

    // add change output
    const changeAmount = Number(
      coveredBoxes.additionalAssets.aggregated.nativeToken,
    );
    if (changeAmount > 0) {
      mtx.addOutput({
        address: fromAddr,
        value: changeAmount,
      });
    }

    return {
      mtx: {
        hex: mtx.toHex(),
      },
      inputSize: mtx.inputs.length,
    };
  };
