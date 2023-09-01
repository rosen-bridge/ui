import AssetFingerprint from '@emurgo/cip14-js';
import { Buffer } from 'buffer';

import adaLoader from '@/_utils/cardanoLoader';
import { hexToString } from '@/_utils';

import { cardanoTokenName } from '@/_constants';
import type {
  AuxiliaryData,
  TransactionBody,
} from '@emurgo/cardano-serialization-lib-browser';

export class Nami {
  API: any;

  constructor() {
    this.API = null;
  }

  async connect() {
    const granted = await (window as any)?.nami?.enable();

    if (!granted) {
      console.error('Failed to connect!');
      return false;
    }
    this.API = granted;
    return true;
  }

  async getAPI() {
    if (!(await this.isConnected())) {
      console.error('Failed to connect!');
      return;
    }
    if (this.API == null) {
      this.API = await (window as any).cardano.nami.enable();
    }
    return this.API;
  }

  async isConnected() {
    return (window as any).cardano?.nami?.isEnabled();
  }

  async getNetworkId() {
    const API = await this.getAPI();
    const networkId = await API.getNetworkId();
    return networkId;
  }

  async getUtxos() {
    const API = await this.getAPI();
    return API.getUtxos();
  }

  async getBalance(fingerprint: string) {
    const API = await this.getAPI();
    const ADA = await adaLoader.load();

    const balanceCBORHex = await API.getBalance();
    const value = ADA.Value.from_bytes(Buffer.from(balanceCBORHex, 'hex'));
    if (fingerprint === cardanoTokenName) {
      return Number(value.coin().to_str());
    }

    const assets = [];
    const multiasset = value.multiasset();

    if (multiasset) {
      const multiAssets = multiasset.keys();
      for (let j = 0; j < multiAssets.len(); j++) {
        const policy = multiAssets.get(j);

        //TODO: check and make sure that this is never gonna be null
        const policyAssets = multiasset.get(policy)!;
        const assetNames = policyAssets.keys();
        for (let k = 0; k < assetNames.len(); k++) {
          const policyAsset = assetNames.get(k);

          //TODO: check and make sure that this is never gonna be null
          const quantity = policyAssets.get(policyAsset)!;
          const asset =
            Buffer.from(policy.to_bytes()).toString('hex') +
            Buffer.from(policyAsset.name()).toString('hex');
          const _policy = asset.slice(0, 56);
          const _name = asset.slice(56);
          const fingerprint = AssetFingerprint.fromParts(
            Buffer.from(_policy, 'hex'),
            Buffer.from(_name, 'hex'),
          ).fingerprint();
          assets.push({
            unit: asset,
            quantity: quantity.to_str(),
            policy: _policy,
            name: hexToString(_name),
            fingerprint,
          });
        }
      }
    }
    const balance = assets.reduce((acc, asset) => {
      return (
        acc + (asset.fingerprint === fingerprint ? Number(asset.quantity) : 0)
      );
    }, 0);

    return balance;
  }

  async getChangeAddress() {
    const API = await this.getAPI();
    const adaLib = await adaLoader.load();
    const raw = await API.getChangeAddress();
    const changeAddress = adaLib.Address.from_bytes(
      Buffer.from(raw, 'hex'),
    ).to_bech32();
    return changeAddress;
  }

  async signAndSubmitTx(txBody: TransactionBody, aux: AuxiliaryData) {
    const API = await this.getAPI();
    const adaLib = await adaLoader.load();

    const transactionWitnessSet = adaLib.TransactionWitnessSet.new();
    const tx = adaLib.Transaction.new(
      txBody,
      adaLib.TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
      aux,
    );

    let txVkeyWitnesses = await API.signTx(
      Buffer.from(tx.to_bytes()).toString('hex'),
      false,
    );

    txVkeyWitnesses = adaLib.TransactionWitnessSet.from_bytes(
      Buffer.from(txVkeyWitnesses, 'hex'),
    );

    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

    const signedTx = adaLib.Transaction.new(
      tx.body(),
      transactionWitnessSet,
      tx.auxiliary_data(),
    );

    const submittedTxHash = await API.submitTx(
      Buffer.from(signedTx.to_bytes()).toString('hex'),
    );
    return submittedTxHash;
  }
}
