import { ErgoBoxProxy } from '@rosen-bridge/ergo-box-selection';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network, RosenAmountValue } from '@rosen-ui/types';
import { UnsignedErgoTxProxy } from '@rosen-ui/wallet-api';
import * as wasm from 'ergo-lib-wasm-nodejs';

import { fee, minBoxValue } from './constants';
import { AssetBalance } from './types';
import { unsignedTransactionToProxy } from './unsignedTransactionToProxy';
import {
  createChangeBox,
  createLockBox,
  getBoxAssets,
  getCoveringBoxes,
  getHeight,
  subtractAssetBalance,
  sumAssetBalance,
} from './utils';

/**
 * generates an unsigned lock transaction on Ergo
 * @param getTokenMap
 * @returns
 */
export const generateUnsignedTx =
  (getTokenMap: () => Promise<TokenMap>) =>
  async (
    changeAddress: string,
    walletUtxos: ErgoBoxProxy[],
    lockAddress: string,
    toChain: Network,
    toAddress: string,
    wrappedAmount: RosenAmountValue,
    bridgeFeeString: string,
    networkFeeString: string,
    token: RosenChainToken,
  ): Promise<UnsignedErgoTxProxy> => {
    const tokenMap = await getTokenMap();
    const tokenId = token[tokenMap.getIdKey(NETWORKS.ergo.key)];
    const unwrappedAmount = tokenMap.unwrapAmount(
      tokenId,
      wrappedAmount,
      NETWORKS.ergo.key,
    ).amount;

    const height = await getHeight();

    const bridgeFee = BigInt(bridgeFeeString);
    const networkFee = BigInt(networkFeeString);

    // generate lock box
    const lockAssets: AssetBalance = {
      nativeToken: minBoxValue,
      tokens: [],
    };
    if (tokenId === 'erg') {
      /**
       * TODO: fix ergo native token name
       * local:ergo/rosen-bridge/ui#100
       */
      lockAssets.nativeToken = unwrappedAmount;
    } else {
      // lock token
      lockAssets.tokens.push({ id: tokenId, value: unwrappedAmount });
    }
    const lockBox = createLockBox(
      lockAddress,
      height,
      tokenId,
      unwrappedAmount,
      toChain,
      toAddress,
      changeAddress,
      bridgeFee,
      networkFee,
    );
    // calculate required assets to get input boxes
    const requiredAssets = sumAssetBalance(lockAssets, {
      nativeToken: minBoxValue + fee,
      tokens: [],
    });

    // get input boxes
    const inputs = await getCoveringBoxes(
      requiredAssets,
      [],
      new Map(),
      walletUtxos.values(),
    );
    if (!inputs.covered) throw Error(`Not enough assets`);
    let inputAssets: AssetBalance = {
      nativeToken: 0n,
      tokens: [],
    };
    // add input boxes to transaction
    const unsignedInputs = new wasm.UnsignedInputs();
    inputs.boxes.forEach((box) => {
      unsignedInputs.add(
        wasm.UnsignedInput.from_box_id(wasm.BoxId.from_str(box.boxId)),
      );
      inputAssets = sumAssetBalance(inputAssets, getBoxAssets(box));
    });

    // calculate change box assets and transaction fee
    const changeAssets = subtractAssetBalance(inputAssets, lockAssets);
    changeAssets.nativeToken -= fee;
    const changeBox = createChangeBox(changeAddress, height, changeAssets);
    const feeBox = wasm.ErgoBoxCandidate.new_miner_fee_box(
      wasm.BoxValue.from_i64(wasm.I64.from_str(fee.toString())),
      height,
    );

    const txOutputs = new wasm.ErgoBoxCandidates(lockBox);
    txOutputs.add(changeBox);
    txOutputs.add(feeBox);

    const unsignedTx = new wasm.UnsignedTransaction(
      unsignedInputs,
      new wasm.DataInputs(),
      txOutputs,
    );
    return unsignedTransactionToProxy(unsignedTx, inputs.boxes);
  };
