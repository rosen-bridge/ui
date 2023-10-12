export const Networks = {
  ergo: 'ergo',
  cardano: 'cardano',
} as const;

// FIXME: read some of this value from the bridge api and migrate the rest of the to env
// local:ergo/rosen-bridge/ui/-/issues/88
export const ergoFeeConfigTokenId =
  'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a';
export const cardanoFeeConfigTokenId =
  'c597eac4db28f62419eab5639122f2bc4955dfedf958e7cdba5248ba2a81210a';
