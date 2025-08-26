import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';
import {
  AssetBalance,
  CardanoUtxo,
  selectCardanoUtxos,
} from '@rosen-bridge/cardano-utxo-selection';
import { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

import { feeAndMinBoxValue } from './constants';
import { ADA_POLICY_ID, CardanoProtocolParams } from './types';
import {
  generateOutputBox,
  getCardanoProtocolParams,
  getTxBuilderConfig,
  getUtxoAssets,
  subtractAssetBalance,
  sumAssetBalance,
  walletUtxoToCardanoUtxo,
} from './utils';

/**
 * generates a lock transaction on Cardano
 * @param getTokenMap
 * @returns a function that provides the hex representation of the unsigned tx upon invocation
 */
export const generateUnsignedTx =
  (getTokenMap: () => Promise<TokenMap>) =>
  async (
    walletUtxos: string[],
    lockAddress: string,
    changeAddressHex: string,
    policyIdHex: string,
    assetNameHex: string,
    wrappedAmount: RosenAmountValue,
    auxiliaryDataHex: string,
  ): Promise<string> => {
    const tokenMap = await getTokenMap();

    const unwrappedAmount = tokenMap.unwrapAmount(
      `${policyIdHex}.${assetNameHex}`,
      wrappedAmount,
      NETWORKS.cardano.key,
    ).amount;

    // converts hex address to bech32 address
    const changeAddress = wasm.Address.from_hex(changeAddressHex).to_bech32();

    // generate txBuilder
    const protocolParams = await getCardanoProtocolParams();

    // calculate lock assets
    const lockAssets: AssetBalance = {
      nativeToken: 0n,
      tokens: [],
    };
    if (policyIdHex === ADA_POLICY_ID) {
      // lock ADA
      lockAssets.nativeToken = unwrappedAmount;
    } else {
      // lock asset
      lockAssets.tokens.push({
        id: `${policyIdHex}.${assetNameHex}`,
        value: unwrappedAmount,
      });
    }
    const lockBox = generateOutputBox(
      lockAssets,
      lockAddress,
      protocolParams.coins_per_utxo_size,
    );

    // calculate required assets to get input boxes
    lockAssets.nativeToken = BigInt(lockBox.amount().coin().to_str());
    const requiredAssets: AssetBalance = structuredClone(lockAssets);

    const utxos = await Promise.all(walletUtxos.map(walletUtxoToCardanoUtxo));
    // add required ADA estimation for tx fee and change box
    requiredAssets.nativeToken += feeAndMinBoxValue;
    // get input boxes, THIS FUNCTION WORKS WITH UNWRAPPED-VALUE
    const inputs = await selectCardanoUtxos(
      requiredAssets,
      [],
      new Map(),
      utxos.values(),
    );
    if (!inputs.covered) {
      const totalInputAda = utxos.reduce(
        (sum, walletUtxo) => sum + BigInt(walletUtxo.value),
        0n,
      );
      throw Error(`Not enough assets`, {
        cause: {
          totalInputAda,
          fromAddress: changeAddress,
        },
      });
    }

    return generateTx(
      lockAssets,
      inputs.boxes,
      lockAddress,
      changeAddress,
      policyIdHex,
      assetNameHex,
      unwrappedAmount,
      auxiliaryDataHex,
      protocolParams,
    );
  };

/**
 * generates a lock transaction on Cardano and returns it with it's required fee
 * @param lockAssets
 * @param inputs
 * @param lockAddress
 * @param changeAddress
 * @param policyIdHex
 * @param assetNameHex
 * @param unwrappedAmount
 * @param auxiliaryDataHex
 * @param protocolParams
 * @param fee
 * @returns
 */
const generateTx = (
  lockAssets: AssetBalance,
  inputs: CardanoUtxo[],
  lockAddress: string,
  changeAddress: string,
  policyIdHex: string,
  assetNameHex: string,
  unwrappedAmount: bigint,
  auxiliaryDataHex: string,
  protocolParams: CardanoProtocolParams,
  fee?: bigint,
): string => {
  const auxiliaryData = wasm.AuxiliaryData.from_hex(auxiliaryDataHex);
  const txBuilder = wasm.TransactionBuilder.new(
    getTxBuilderConfig(protocolParams),
  );

  // generate lock box
  const lockBox = generateOutputBox(
    lockAssets,
    lockAddress,
    protocolParams.coins_per_utxo_size,
  );

  // add lock box to tx and calculate required assets to get input boxes
  lockAssets.nativeToken = BigInt(lockBox.amount().coin().to_str());
  const requiredAssets: AssetBalance = structuredClone(lockAssets);
  txBuilder.add_output(lockBox);

  // add required ADA estimation for tx fee and change box
  requiredAssets.nativeToken += feeAndMinBoxValue;
  // get input boxes, THIS FUNCTION WORKS WITH UNWRAPPED-VALUE
  let inputAssets: AssetBalance = {
    nativeToken: 0n,
    tokens: [],
  };
  // add input boxes to transaction
  inputs.forEach((utxo) => {
    inputAssets = sumAssetBalance(inputAssets, getUtxoAssets(utxo));
    txBuilder.add_regular_input(
      wasm.Address.from_bech32(utxo.address),
      wasm.TransactionInput.new(
        wasm.TransactionHash.from_hex(utxo.txId),
        utxo.index,
      ),
      lockBox.amount(),
    );
  });

  // set auxiliary data
  txBuilder.set_auxiliary_data(auxiliaryData);

  // add the change box
  const changeAssets = subtractAssetBalance(inputAssets, lockAssets);
  changeAssets.nativeToken -= fee ?? 0n;
  const changeBox = generateOutputBox(
    changeAssets,
    changeAddress,
    protocolParams.coins_per_utxo_size,
  );
  txBuilder.add_output(changeBox);

  // if fee is not provided, the transaction will be generated again once fee is estimated
  if (!fee) {
    // generate the tx again with the estimated fee
    return generateTx(
      lockAssets,
      inputs,
      lockAddress,
      changeAddress,
      policyIdHex,
      assetNameHex,
      unwrappedAmount,
      auxiliaryDataHex,
      protocolParams,
      BigInt(txBuilder.min_fee().to_str()),
    );
  } else {
    // set tx fee and auxiliary data
    txBuilder.set_fee(wasm.BigNum.from_str(fee.toString()));

    // build transaction
    const txBody = txBuilder.build();

    // build unsigned transaction object
    const witnessSet = wasm.TransactionWitnessSet.new();
    const tx = wasm.Transaction.new(txBody, witnessSet, auxiliaryData);
    return tx.to_hex();
  }
};
