export const apiBaseUrl = 'http://localhost:3000';

// export const guardPks = [
//   '03bc166a669b92a9b169c943013c57cce01f7cc441c3e29340b700143091add58b',
//   '028d64c7759f986f1629d600e82d58d825504d711960379361e379e6cb612cc210',
//   '022f1c84514fcc20df0ea0de455a866f4380af59b4169e5c7610bcb8be28893410',
//   '03c925f32cfb457216d0fa686a48d73551df96abd7be9505bbca48a5fd7d3cda49',
//   '03994351b75ee919e31eecc42534b1d10dfebc37048d53171422d2a9932a3345aa',
//   '023a5bacb4dba45c8a64ff47c5fa6f4b3abecc32bbb01410cc0bbfb333d5347baf',
// ] as const;

export const guardPks = [
  '020e0e8f88a63aea5687650ed303bd823aa626e732719ced2256fe143361ec8514',
  '02f551393ecbae2e6bc997528fd8644549ca6aef283aac7f812af2e551bd0171df',
  '03c74446ca03a0dafc3e81d6ea248eb281a6fd71633081221c6a8f482241996b90',
  '03acf1ae3616a5bcc3af2e119a9ab2df4dba8735645475c02de1b72bfbcfb1851f',
  '02b9b6ef684e06b3c88fce8f5ea1cc6a29c104068c936ba9eade20f194fa126000',
  '02674b60d6712d0629d4bb2b2ad18383670ac0fc225139991f0bc03d34b551e200',
] as const;

export const guardSecrets: Record<(typeof guardPks)[number], string> = {
  [guardPks[0]]:
    '3b0fb06d2c9a0974554123b926eef20d1a4ff7b5748a74e6437c6be904b3cf06',
  [guardPks[1]]:
    '29b340190c8a2c156876d5d4a1ec668ec625ec818664b267eeabf5f121c379c8',
  [guardPks[2]]:
    '8e7e184d2b45105639fa94e191570605416b278845df92679c98030a219cb2aa',
  [guardPks[3]]:
    'f5adde5e63950f79f9ad687183c5119c8f77614264dc1201c149976f9938c49c',
  [guardPks[4]]:
    'ab6c205131f324716780d63c62b0c42b848e145c20265ddecac67d5525172157',
  [guardPks[5]]:
    '8ef0894a6834dbd1d02a5816348f009db21d535151e2ee516325fc9891ea21d3',
};

export const SUPPORTED_CHAINS = [
  'ergo',
  'cardano',
  'bitcoin',
  'ethereum',
  'binance',
  'doge',
  'firo',
  'bitcoin-runes',
] as const;

export type TxType = 'payment' | 'reward';

export type EventStatus =
  | 'pending-payment'
  | 'pending-reward'
  | 'in-payment'
  | 'in-reward'
  | 'completed'
  | 'spent'
  | 'rejected'
  | 'timeout'
  | 'reached-limit'
  | 'payment-waiting'
  | 'reward-waiting';

export type TxStatus =
  | 'approved'
  | 'in-sign'
  | 'sign-failed'
  | 'signed'
  | 'sent'
  | 'invalid'
  | 'completed';

export type AggregateEventStatus =
  | 'finished'
  | 'in-reward'
  | 'pending-reward'
  | 'in-payment'
  | 'rejected'
  | 'timeout'
  | 'reached-limit'
  | 'payment-waiting'
  | 'reward-waiting'
  | 'pending-payment'
  | 'waiting-for-confirmation';

export type AggregateTxStatus =
  | 'in-sign'
  | 'signed'
  | 'completed'
  | 'sent'
  | 'invalid';
