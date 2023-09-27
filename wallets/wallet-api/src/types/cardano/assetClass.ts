import { PolicyId, AssetName, HexString } from '../common';

export type AssetClass = {
  policyId: PolicyId;
  name: AssetName;
  nameHex: HexString;
};
