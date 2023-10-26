'use server';

import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';
import { generateLockAuxiliaryData } from './utils';
import { generateTxBody } from './generateTx';
import { Buffer } from 'buffer';
import { CipWalletApi } from '@rosen-ui/wallet-api';

/**
 * generates, signs and sends lock transaction on Cardano
 * @param wallet
 * @param lockAddress
 * @param toChain
 * @param toAddress
 * @param policyIdHex
 * @param assetNameHex
 * @param amount
 * @param bridgeFee
 * @param networkFee
 * @returns
 */
export const transferOnCardano = async (
  wallet: CipWalletApi,
  lockAddress: string,
  toChain: string,
  toAddress: string,
  policyIdHex: string,
  assetNameHex: string,
  amount: bigint,
  bridgeFee: bigint,
  networkFee: bigint,
): Promise<string> => {
  const changeAddress = wasm.Address.from_hex(
    await wallet.getChangeAddress(),
  ).to_bech32();

  const auxiliaryData = generateLockAuxiliaryData(
    toChain,
    toAddress,
    changeAddress,
    networkFee.toString(),
    bridgeFee.toString(),
  );

  const txBody = await generateTxBody(
    wallet,
    lockAddress,
    changeAddress,
    policyIdHex,
    assetNameHex,
    amount,
    auxiliaryData,
  );

  const witnessSet = wasm.TransactionWitnessSet.new();
  const tx = wasm.Transaction.new(txBody, witnessSet, auxiliaryData);
  const vKeys = wasm.TransactionWitnessSet.from_bytes(
    Buffer.from(await wallet.signTx(tx.to_hex(), false), 'hex'),
  ).vkeys();
  if (vKeys) witnessSet.set_vkeys(vKeys);

  const signedTx = wasm.Transaction.new(
    txBody,
    witnessSet,
    tx.auxiliary_data(),
  );

  return await wallet.submitTx(signedTx.to_hex());
};
