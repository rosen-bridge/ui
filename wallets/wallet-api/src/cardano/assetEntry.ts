import { Lovelace } from '../types';
import { AdaAssetName, AdaAssetNameHex, AdaPolicyId } from './constants';
import { AssetEntry } from './types';

export function AdaEntry(quantity: Lovelace): AssetEntry {
  return {
    name: AdaAssetName,
    policyId: AdaPolicyId,
    quantity,
    nameHex: AdaAssetNameHex,
  };
}
