import CardanoWasm from '@emurgo/cardano-serialization-lib-browser';

import { encodeHex, decodeHex } from '@rosen-ui/utils';
import { HexString, Value, PolicyId, AssetEntry } from '../types';

import { AdaEntry } from './assetEntry';

/**
 * handles the decoding of the wasm values returned by
 * the cardano wallets
 */

export function fromWasmValue(value: CardanoWasm.Value): Value {
  const adaEntry = AdaEntry(BigInt(value.coin().to_str()));
  const ma = value.multiasset();
  if (ma) {
    const policies = ma.keys();
    const numPolicies = policies.len();
    const assetsGrouped: [PolicyId, CardanoWasm.Assets][] = [];
    const totalEntries: AssetEntry[] = [];
    for (let i = 0; i < numPolicies; i++) {
      const p = policies.get(i);
      const policyId = encodeHex(p.to_bytes());
      assetsGrouped.push([policyId, ma.get(p)!]);
    }
    for (const [policyId, as] of assetsGrouped) {
      const assets = as.keys();
      const numAssets = assets.len();
      const entries: AssetEntry[] = [];
      for (let i = 0; i < numAssets; i++) {
        const assetName = assets.get(i);
        const nameStr = new TextDecoder().decode(assetName.name());
        const nameHex = assetName.to_hex();
        const quantity = BigInt(as.get(assetName)!.to_str());
        entries.push({ name: nameStr, policyId, quantity, nameHex });
      }
      totalEntries.push(...entries);
    }
    totalEntries.push(adaEntry);
    return totalEntries;
  }
  return [adaEntry];
}

export function decodeWasmValue(raw: HexString, R: typeof CardanoWasm): Value {
  return fromWasmValue(R.Value.from_bytes(decodeHex(raw)));
}
