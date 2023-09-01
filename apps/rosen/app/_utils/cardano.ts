import adaLoader from '@/_utils/cardanoLoader';
import { Buffer } from 'buffer';

import {
  adaMinCoin,
  adaFeeCoef,
  adaFeeConstant,
  adaMaxTxSize,
  adaMaxValueSize,
  adaPoolDeposit,
  adaKeyDeposit,
  cardanoBankAddress,
} from '@/_constants';

//TODO: fix this
const getProccessedUtxos = async (rawUtxos: any) => {
  const adaLib = await adaLoader.load();
  let Utxos = [];

  try {
    for (const rawUtxo of rawUtxos) {
      const utxo = adaLib.TransactionUnspentOutput.from_bytes(
        Buffer.from(rawUtxo, 'hex'),
      );
      const input = utxo.input();
      const txid = Buffer.from(input.transaction_id().to_bytes()).toString(
        'hex',
      );
      const txindx = input.index();
      const output = utxo.output();
      const amount = output.amount().coin().to_str(); // ADA amount in lovelace
      const multiasset = output.amount().multiasset();
      let multiAssetStr = '';

      if (multiasset) {
        const keys = multiasset.keys();
        const N = keys.len();
        for (let i = 0; i < N; i++) {
          const policyId = keys.get(i);
          const policyIdHex = Buffer.from(policyId.to_bytes()).toString('hex');

          //TODO: check and make sure that this is never gonna be null
          const assets = multiasset.get(policyId)!;
          const assetNames = assets.keys();
          const K = assetNames.len();

          for (let j = 0; j < K; j++) {
            const assetName = assetNames.get(j);
            const assetNameString = Buffer.from(assetName.name()).toString();
            const assetNameHex = Buffer.from(assetName.name()).toString('hex');
            const multiassetAmt = multiasset.get_asset(policyId, assetName);
            multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`;
          }
        }
      }

      const obj = {
        txid: txid,
        txindx: txindx,
        amount: amount,
        str: `${txid} #${txindx} = ${amount}`,
        multiAssetStr: multiAssetStr,
        TransactionUnspentOutput: utxo,
      };
      Utxos.push(obj);
    }
    return Utxos;
  } catch (err) {
    console.log(err);
  }
};

export const getAux = async (
  toAddress: string,
  fromAddress: string,
  networkFee: BigInt,
  bridgeFee: BigInt,
) => {
  const adaLib = await adaLoader.load();

  const metadataJson = {
    to: 'ergo',
    bridgeFee: bridgeFee.toString(),
    networkFee: networkFee.toString(),
    toAddress,
  } as { [key: string]: string };

  const map = adaLib.MetadataMap.new();
  Object.keys(metadataJson).forEach((key) => {
    map.insert(
      adaLib.TransactionMetadatum.new_text(key),
      adaLib.TransactionMetadatum.new_text(metadataJson[key]),
    );
  });

  const fromAddressList = adaLib.MetadataList.new();
  let i = 0;
  while (i < fromAddress.length) {
    fromAddressList.add(
      adaLib.TransactionMetadatum.new_text(fromAddress.substr(i, 64)),
    );
    i += 64;
  }

  map.insert(
    adaLib.TransactionMetadatum.new_text('fromAddress'),
    adaLib.TransactionMetadatum.new_list(fromAddressList),
  );
  const generalTxMetadata = adaLib.GeneralTransactionMetadata.new();
  generalTxMetadata.insert(
    adaLib.BigNum.from_str('0'),
    adaLib.TransactionMetadatum.new_map(map),
  );
  const aux = adaLib.AuxiliaryData.new();
  aux.set_metadata(generalTxMetadata);
  return aux;
};

export const generateAdaTX = async (
  changeAddress: string,
  assetNameHex: string,
  assetPolicyIdHex: string,
  assetAmount: number,
  utxos: unknown,
  toAddress: string,
  networkFee: BigInt,
  bridgeFee: BigInt,
) => {
  const adaLib = await adaLoader.load();
  const txBuilder = adaLib.TransactionBuilder.new(
    adaLib.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        adaLib.LinearFee.new(
          adaLib.BigNum.from_str(adaFeeCoef),
          adaLib.BigNum.from_str(adaFeeConstant),
        ),
      )
      .pool_deposit(adaLib.BigNum.from_str(adaPoolDeposit))
      .key_deposit(adaLib.BigNum.from_str(adaKeyDeposit))
      .coins_per_utxo_word(adaLib.BigNum.from_str(adaMinCoin))
      .max_value_size(adaMaxValueSize)
      .max_tx_size(adaMaxTxSize)
      .prefer_pure_change(true)
      .build(),
  );
  const shelleyOutputAddress = adaLib.Address.from_bech32(cardanoBankAddress);
  const shelleyChangeAddress = adaLib.Address.from_bech32(changeAddress);

  let txOutputBuilder = adaLib.TransactionOutputBuilder.new();
  txOutputBuilder = txOutputBuilder.with_address(shelleyOutputAddress);

  let txOutputAmountBuilder = txOutputBuilder.next();

  if (assetPolicyIdHex === '') {
    const lovelaceAmount = BigInt(assetAmount);
    txOutputAmountBuilder = txOutputAmountBuilder.with_coin(
      adaLib.BigNum.from_str(lovelaceAmount.toString()),
    );
  } else {
    let multiAsset = adaLib.MultiAsset.new();
    let assets = adaLib.Assets.new();
    assets.insert(
      adaLib.AssetName.new(Buffer.from(assetNameHex, 'hex')),
      adaLib.BigNum.from_str(assetAmount.toString()),
    );
    multiAsset.insert(
      adaLib.ScriptHash.from_bytes(Buffer.from(assetPolicyIdHex, 'hex')),
      assets,
    );

    txOutputAmountBuilder =
      txOutputAmountBuilder.with_asset_and_min_required_coin(
        multiAsset,
        adaLib.BigNum.from_str(adaMinCoin),
      );
  }
  const txOutput = txOutputAmountBuilder.build();
  txBuilder.add_output(txOutput);

  let txOutputs = adaLib.TransactionUnspentOutputs.new();

  //TODO: check and make sure that this is never gonna be null
  const processedUtxos = await getProccessedUtxos(utxos);

  for (const utxo of processedUtxos!) {
    txOutputs.add(utxo.TransactionUnspentOutput);
  }
  txBuilder.add_inputs_from(txOutputs, 2);
  txBuilder.add_change_if_needed(shelleyChangeAddress);

  const aux = await getAux(toAddress, changeAddress, networkFee, bridgeFee);
  txBuilder.set_auxiliary_data(aux);
  const txBody = txBuilder.build();
  return txBody;
};

export const isValidAddressCardano = async (address: string) => {
  const adaLib = await adaLoader.load();
  try {
    adaLib.Address.from_bech32(address).free();
    return true;
  } catch (e) {
    return false;
  }
};
