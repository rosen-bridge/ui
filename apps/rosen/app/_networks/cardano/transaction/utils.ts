'use server';

import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';
import { CardanoProtocolParams } from './types';
import {
  AssetBalance,
  CardanoAsset,
  CardanoUtxo,
  TokenInfo,
} from '@rosen-bridge/cardano-utxo-selection';

/**
 * gets Cardano protocol params
 * @returns
 */
export const getCardanoProtocolParams =
  async (): Promise<CardanoProtocolParams> => {
    // TODO: fetch data from koios
    return {
      min_fee_a: 44,
      min_fee_b: 155381,
      pool_deposit: '500000000',
      key_deposit: '2000000',
      max_value_size: 5000,
      max_tx_size: 16384,
      coins_per_utxo_size: '4310',
    };
  };

/**
 * generates transaction builder config using protocol params
 * @param params
 * @returns
 */
export const getTxBuilderConfig = (
  params: CardanoProtocolParams,
): wasm.TransactionBuilderConfig => {
  return wasm.TransactionBuilderConfigBuilder.new()
    .fee_algo(
      wasm.LinearFee.new(
        wasm.BigNum.from_str(params.min_fee_a.toString()),
        wasm.BigNum.from_str(params.min_fee_b.toString()),
      ),
    )
    .pool_deposit(wasm.BigNum.from_str(params.pool_deposit))
    .key_deposit(wasm.BigNum.from_str(params.key_deposit))
    .coins_per_utxo_byte(wasm.BigNum.from_str(params.coins_per_utxo_size))
    .max_value_size(params.max_value_size)
    .max_tx_size(params.max_tx_size)
    .prefer_pure_change(true)
    .build();
};

/**
 * generates metadata for lock transaction
 * @param toChain
 * @param toAddress
 * @param fromAddress
 * @param networkFee
 * @param bridgeFee
 * @returns
 */
export const generateLockAuxiliaryData = (
  toChain: string,
  toAddress: string,
  fromAddress: string,
  networkFee: string,
  bridgeFee: string,
): wasm.AuxiliaryData => {
  const metadataJson = {
    to: toChain,
    bridgeFee: bridgeFee,
    networkFee: networkFee,
    toAddress,
  };
  const map = wasm.MetadataMap.new();
  for (const key in metadataJson) {
    map.insert(
      wasm.TransactionMetadatum.new_text(key),
      wasm.TransactionMetadatum.new_text(
        metadataJson[key as keyof typeof metadataJson],
      ),
    );
  }

  const fromAddressList = wasm.MetadataList.new();
  let i = 0;
  while (i < fromAddress.length) {
    fromAddressList.add(
      wasm.TransactionMetadatum.new_text(fromAddress.substring(i, 64)),
    );
    i += 64;
  }

  map.insert(
    wasm.TransactionMetadatum.new_text('fromAddress'),
    wasm.TransactionMetadatum.new_list(fromAddressList),
  );
  const generalTxMetadata = wasm.GeneralTransactionMetadata.new();
  generalTxMetadata.insert(
    wasm.BigNum.from_str('0'),
    wasm.TransactionMetadatum.new_map(map),
  );
  const aux = wasm.AuxiliaryData.new();
  aux.set_metadata(generalTxMetadata);
  return aux;
};

/**
 * converts utxo type from wallet type to CardanoUtxo
 * @param serializedUtxo serialized hex string of TransactionUnspentOutput
 */
export const walletUtxoToCardanoUtxo = (
  serializedUtxo: string,
): CardanoUtxo => {
  const utxo = wasm.TransactionUnspentOutput.from_hex(serializedUtxo);
  const assets: Array<CardanoAsset> = [];

  const multiAsset = utxo.output().amount().multiasset();
  if (multiAsset) {
    for (let i = 0; i < multiAsset.keys().len(); i++) {
      const policyId = multiAsset.keys().get(i);
      const policyAssets = multiAsset.get(policyId)!;
      for (let j = 0; j < policyAssets.len(); j++) {
        const assetName = policyAssets.keys().get(j);
        assets.push({
          policyId: policyId.to_hex(),
          assetName: Buffer.from(assetName.name()).toString('hex'),
          quantity: BigInt(policyAssets.get(assetName)!.to_str()),
        });
      }
    }
  }

  return {
    txId: utxo.input().transaction_id().to_hex(),
    index: utxo.input().index(),
    value: BigInt(utxo.output().amount().coin().to_str()),
    assets: assets,
    address: utxo.output().address().to_bech32(),
  };
};

/**
 * sums two AssetBalance
 * @param a first AssetBalance object
 * @param b second AssetBalance object
 * @returns aggregated AssetBalance
 */
export const sumAssetBalance = (
  a: AssetBalance,
  b: AssetBalance,
): AssetBalance => {
  // sum native token
  const nativeToken = a.nativeToken + b.nativeToken;
  const tokens: Array<TokenInfo> = [];

  // add all tokens to result
  [...a.tokens, ...b.tokens].forEach((token) => {
    const targetToken = tokens.find((item) => item.id === token.id);
    if (targetToken) targetToken.value += token.value;
    else tokens.push(structuredClone(token));
  });

  return {
    nativeToken,
    tokens,
  };
};

/**
 * converts CardanoUtxo assets to AssetBalance
 * @param utxo
 * @returns
 */
export const getUtxoAssets = (utxo: CardanoUtxo): AssetBalance => {
  return {
    nativeToken: utxo.value,
    tokens: utxo.assets.map((asset) => ({
      id: `${asset.policyId}.${asset.assetName}`,
      value: asset.quantity,
    })),
  };
};

/**
 * subtracts two AssetBalance
 * @param a first AssetBalance object
 * @param b second AssetBalance object
 * @param minimumNativeToken minimum allowed native token
 * @param allowNegativeNativeToken if true, sets nativeToken as 0 instead of throwing error
 * @returns reduced AssetBalance
 */
export const subtractAssetBalance = (
  a: AssetBalance,
  b: AssetBalance,
  minimumNativeToken = 0n,
  allowNegativeNativeToken = false,
): AssetBalance => {
  // sum native token
  let nativeToken = 0n;
  if (a.nativeToken > b.nativeToken + minimumNativeToken)
    nativeToken = a.nativeToken - b.nativeToken;
  else if (allowNegativeNativeToken) nativeToken = 0n;
  else
    throw new Error(
      `Cannot reduce native token: [${a.nativeToken.toString()}] is less than [${b.nativeToken.toString()} + ${minimumNativeToken.toString()}]`,
    );

  // reduce all `b` tokens
  const tokens = structuredClone(a.tokens);
  b.tokens.forEach((token) => {
    const index = tokens.findIndex((item) => item.id === token.id);
    if (index !== -1) {
      if (tokens[index].value > token.value) tokens[index].value -= token.value;
      else if (tokens[index].value === token.value) tokens.splice(index, 1);
      else
        throw new Error(
          `Cannot reduce token [${token.id}]: [${tokens[
            index
          ].value.toString()}] is less than [${token.value.toString()}]`,
        );
    } else
      throw new Error(`Cannot reduce token [${token.id}]: Token not found`);
  });

  return {
    nativeToken,
    tokens,
  };
};

/**
 * generates cardano box in TransactionOutput type
 * @param balance
 * @param address
 * @returns
 */
export const generateOutputBox = (
  balance: AssetBalance,
  address: string,
  coinsPerUtxoByte: string,
): wasm.TransactionOutput => {
  let changeBoxBuilder = wasm.TransactionOutputBuilder.new()
    .with_address(wasm.Address.from_bech32(address))
    .next();

  let multiAsset = wasm.MultiAsset.new();
  balance.tokens.forEach((token) => {
    const assetUnit = token.id.split('.');
    const policyId = wasm.ScriptHash.from_hex(assetUnit[0]);
    const assetName = wasm.AssetName.new(Buffer.from(assetUnit[1], 'hex'));
    multiAsset.set_asset(
      policyId,
      assetName,
      wasm.BigNum.from_str(token.value.toString()),
    );
  });

  return balance.nativeToken
    ? changeBoxBuilder
        .with_value(
          wasm.Value.new_with_assets(
            wasm.BigNum.from_str(balance.nativeToken.toString()),
            multiAsset,
          ),
        )
        .build()
    : changeBoxBuilder
        .with_asset_and_min_required_coin_by_utxo_cost(
          multiAsset,
          wasm.DataCost.new_coins_per_byte(
            wasm.BigNum.from_str(coinsPerUtxoByte),
          ),
        )
        .build();
};
