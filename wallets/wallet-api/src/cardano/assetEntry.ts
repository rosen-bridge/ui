import { AdaAssetName, AdaAssetNameHex, AdaPolicyId } from '../constants';

import { AssetEntry, AssetClass, Lovelace } from '../types';

export function assetEntryToClass(e: AssetEntry): AssetClass {
  return { policyId: e.policyId, name: e.name, nameHex: e.nameHex };
}

export function AdaEntry(quantity: Lovelace): AssetEntry {
  return {
    name: AdaAssetName,
    policyId: AdaPolicyId,
    quantity,
    nameHex: AdaAssetNameHex,
  };
}
