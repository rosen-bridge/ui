export const Networks = {
  ergo: 'ergo',
  cardano: 'cardano',
} as const;

// FIXME: read some of this value from the bridge api and migrate the rest of the to env
// local:ergo/rosen-bridge/ui/-/issues/88
export const feeConfigTokenId =
  '05690d3e7a8daae13495b32af8ab58aaec8a5435f5974f6adf17095d28cac1f5';
