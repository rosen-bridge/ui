import * as wasm from 'ergo-lib-wasm-nodejs';

import { ErgoBoxProxy, UnsignedErgoTxProxy } from './types';

/**
 * converts wasm UnsignedTransaction to UnsignedErgoTxProxy format
 * @param unsignedTx
 * @param inputs
 * @returns
 */
export const unsignedTransactionToProxy = (
  unsignedTx: wasm.UnsignedTransaction,
  inputs: ErgoBoxProxy[],
): UnsignedErgoTxProxy => {
  const unsignedErgoTxProxy = unsignedTx.to_js_eip12();
  unsignedErgoTxProxy.inputs = inputs.map((box) => {
    return {
      ...box,
      extension: {},
    };
  });
  return unsignedErgoTxProxy;
};
