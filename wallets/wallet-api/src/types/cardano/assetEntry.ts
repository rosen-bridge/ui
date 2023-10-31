import { HexString, AssetName, PolicyId } from '../common';

export type AssetEntry = {
  name: AssetName;
  policyId: PolicyId;
  nameHex: HexString;
  quantity: bigint;
};
