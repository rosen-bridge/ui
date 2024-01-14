'use server';

import { UnsignedErgoTxProxy } from '@rosen-ui/wallet-api';
import { fee, minBoxValue } from './consts';
import { unsignedTransactionToProxy } from './proxyTransformation';
import { AssetBalance } from './types';
import {
  createChangeBox,
  createLockBox,
  getBoxAssets,
  getCoveringBoxes,
  getHeight,
  subtractAssetBalance,
  sumAssetBalance,
} from './utils';
import * as wasm from 'ergo-lib-wasm-nodejs';
import { ErgoBoxProxy } from '@rosen-bridge/ergo-box-selection';

/**
 * generates an unsigned lock transaction on Ergo
 * @param changeAddress
 * @param walletUtxos
 * @param lockAddress
 * @param toChain
 * @param toAddress
 * @param tokenId
 * @param amount
 * @param bridgeFee
 * @param networkFee
 * @returns
 */
export const generateUnsignedTx = async (
  changeAddress: string,
  walletUtxos: ErgoBoxProxy[],
  lockAddress: string,
  toChain: string,
  toAddress: string,
  tokenId: string,
  amount: bigint,
  bridgeFee: bigint,
  networkFee: bigint,
): Promise<UnsignedErgoTxProxy> => {
  const height = await getHeight();

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
    lockAssets.nativeToken = amount;
  } else {
    // lock token
    lockAssets.tokens.push({ id: tokenId, value: amount });
  }
  const lockBox = createLockBox(
    lockAddress,
    height,
    tokenId,
    amount,
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
