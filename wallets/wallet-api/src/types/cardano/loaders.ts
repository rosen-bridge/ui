export type CardanoWasm =
  | typeof import('@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib')
  | typeof import('@emurgo/cardano-serialization-lib-nodejs/cardano_serialization_lib');
