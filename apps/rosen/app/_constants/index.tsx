export const Networks = {
  ergo: 'ergo',
  cardano: 'cardano',
} as const;

// FIXME: read some of this value from the bridge api and migrate the rest of the to env
// https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/88
export const ergoFeeConfigTokenId =
  'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a';
export const cardanoFeeConfigTokenId =
  'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a';
export const cardanoBankAddress =
  'addr1v9f6u4cy7n59gd3vezcgkhsz988unx9jxamfawjkz4apqmqtwafc2';
export const ergoExplorerUrl = 'https://api.ergoplatform.com/api';
export const cardanoExplorerUrl = 'https://api.koios.rest/api';

export const feeRatioDivisor = 10000n;

export const nextFeeHeight = 5;
export const ergTokenNameEIP12 = 'ERG';

export const cardanoTokenName = 'lovelace';
export const adaFeeCoef = '44';

export const adaFeeConstant = '255381';
export const adaPoolDeposit = '500000000';
export const adaKeyDeposit = '2000000';
export const adaMinCoin = '34482';
export const adaMaxValueSize = 5000;
export const adaMaxTxSize = 16384;
export const minBoxValue = '1500000';
export const ergoFee = '1100000';
