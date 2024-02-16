'use server';

import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';
import {
  AssetBalance,
  selectCardanoUtxos,
} from '@rosen-bridge/cardano-utxo-selection';
import {
  generateOutputBox,
  getCardanoProtocolParams,
  getTxBuilderConfig,
  getUtxoAssets,
  subtractAssetBalance,
  sumAssetBalance,
  walletUtxoToCardanoUtxo,
} from './utils';
import { feeAndMinBoxValue } from './consts';
import { ADA_POLICY_ID } from './types';

/**
 * generates a lock transaction on Cardano
 * @param wallet
 * @param lockAddress
 * @param changeAddressHex
 * @param policyIdHex
 * @param assetNameHex
 * @param amount
 * @param auxiliaryData
 * @returns hex representation of the unsigned tx
 */
export const generateUnsignedTx = async (
  walletUtxos: string[],
  lockAddress: string,
  changeAddressHex: string,
  policyIdHex: string,
  assetNameHex: string,
  amountString: string,
  auxiliaryDataHex: string,
): Promise<string> => {
  const amount = BigInt(amountString);

  // converts hex address to bech32 address
  const changeAddress = wasm.Address.from_hex(changeAddressHex).to_bech32();

  const auxiliaryData = wasm.AuxiliaryData.from_hex(auxiliaryDataHex);
  // generate txBuilder
  const protocolParams = await getCardanoProtocolParams();
  const txBuilder = wasm.TransactionBuilder.new(
    getTxBuilderConfig(protocolParams),
  );

  // generate lock box
  const lockAssets: AssetBalance = {
    nativeToken: 0n,
    tokens: [],
  };
  if (policyIdHex === ADA_POLICY_ID) {
    // lock ADA
    lockAssets.nativeToken = amount;
  } else {
    // lock asset
    lockAssets.tokens.push({
      id: `${policyIdHex}.${assetNameHex}`,
      value: amount,
    });
  }
  const lockBox = generateOutputBox(
    lockAssets,
    lockAddress,
    protocolParams.coins_per_utxo_size,
  );

  // add lock box to tx and calculate required assets to get input boxes
  lockAssets.nativeToken = BigInt(lockBox.amount().coin().to_str());
  const requiredAssets: AssetBalance = structuredClone(lockAssets);
  txBuilder.add_output(lockBox);

  const utxos = await Promise.all(walletUtxos.map(walletUtxoToCardanoUtxo));
  // add required ADA estimation for tx fee and change box
  requiredAssets.nativeToken += feeAndMinBoxValue;
  // get input boxes
  const inputs = await selectCardanoUtxos(
    requiredAssets,
    [],
    new Map(),
    utxos.values(),
  );
  if (!inputs.covered) throw Error(`Not enough assets`);
  let inputAssets: AssetBalance = {
    nativeToken: 0n,
    tokens: [],
  };
  // add input boxes to transaction
  inputs.boxes.forEach((utxo) => {
    inputAssets = sumAssetBalance(inputAssets, getUtxoAssets(utxo));
    txBuilder.add_input(
      wasm.Address.from_bech32(utxo.address),
      wasm.TransactionInput.new(
        wasm.TransactionHash.from_hex(utxo.txId),
        utxo.index,
      ),
      lockBox.amount(),
    );
  });

  // set temp fee and auxiliary data
  txBuilder.set_fee(txBuilder.min_fee());
  txBuilder.set_auxiliary_data(auxiliaryData);

  // calculate change box assets and transaction fee
  const changeAssets = subtractAssetBalance(inputAssets, lockAssets);
  const tempChangeBox = generateOutputBox(
    changeAssets,
    changeAddress,
    protocolParams.coins_per_utxo_size,
  );
  const fee = txBuilder
    .min_fee()
    .checked_add(txBuilder.fee_for_output(tempChangeBox));
  changeAssets.nativeToken -= BigInt(fee.to_str());
  const changeBox = generateOutputBox(
    changeAssets,
    changeAddress,
    protocolParams.coins_per_utxo_size,
  );
  txBuilder.add_output(changeBox);

  // set tx fee
  txBuilder.set_fee(fee);

  // build transaction
  const txBody = txBuilder.build();

  // build unsigned transaction object
  const witnessSet = wasm.TransactionWitnessSet.new();
  const tx = wasm.Transaction.new(txBody, witnessSet, auxiliaryData);
  return tx.to_hex();
};
