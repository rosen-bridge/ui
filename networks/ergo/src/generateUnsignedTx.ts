import { ErgoBoxSelection } from '@rosen-bridge/ergo-box-selection';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network, RosenAmountValue } from '@rosen-ui/types';
import { ErgoBoxProxy, UnsignedErgoTxProxy } from '@rosen-ui/wallet-api';
import * as wasm from 'ergo-lib-wasm-nodejs';

import { fee, minBoxValue } from './constants';
import { AssetBalance } from './types';
import { unsignedTransactionToProxy } from './unsignedTransactionToProxy';
import {
  createChangeBox,
  createLockBox,
  getHeight,
} from './utils';

const selector = new ErgoBoxSelection();

/**
 * generates an unsigned lock transaction on Ergo
 * @param getTokenMap
 * @returns
 */
export const generateUnsignedTx =
  (getTokenMap: () => Promise<TokenMap>) =>
  async (
    changeAddress: string,
    walletUtxos: ErgoBoxProxy[],
    lockAddress: string,
    toChain: Network,
    toAddress: string,
    wrappedAmount: RosenAmountValue,
    bridgeFeeString: string,
    networkFeeString: string,
    token: RosenChainToken,
  ): Promise<UnsignedErgoTxProxy> => {
    const tokenMap = await getTokenMap();
    const unwrappedAmount = tokenMap.unwrapAmount(
      token.tokenId,
      wrappedAmount,
      NETWORKS.ergo.key,
    ).amount;

    const height = await getHeight();

    const bridgeFee = BigInt(bridgeFeeString);
    const networkFee = BigInt(networkFeeString);

    // generate lock box
    const lockAssets: AssetBalance = {
      nativeToken: minBoxValue,
      tokens: [],
    };
    if (token.tokenId === 'erg') {
      /**
       * TODO: fix ergo native token name
       * local:ergo/rosen-bridge/ui#100
       */
      lockAssets.nativeToken = unwrappedAmount;
    } else {
      // lock token
      lockAssets.tokens.push({ id: token.tokenId, value: unwrappedAmount });
    }
    const lockBox = createLockBox(
      lockAddress,
      height,
      token.tokenId,
      unwrappedAmount,
      toChain,
      toAddress,
      changeAddress,
      bridgeFee,
      networkFee,
    );

    const ergoBoxes = walletUtxos.map((walletUtxo) =>
      wasm.ErgoBox.from_json(JSON.stringify(walletUtxo)),
    );

    // get input boxes
    const inputs = await selector.getCoveringBoxes(
      lockAssets,
      [],
      new Map(),
      ergoBoxes.values(),
      undefined,
      undefined,
      () => fee,
    );
    if (!inputs.covered) throw Error(`Not enough assets`);
    // add input boxes to transaction
    const unsignedInputs = new wasm.UnsignedInputs();
    inputs.boxes.forEach((box) => {
      unsignedInputs.add(wasm.UnsignedInput.from_box_id(box.box_id()));
    });

    const feeBox = wasm.ErgoBoxCandidate.new_miner_fee_box(
      wasm.BoxValue.from_i64(wasm.I64.from_str(inputs.additionalAssets.fee.toString())),
      height,
    );

    const txOutputs = new wasm.ErgoBoxCandidates(lockBox);

    inputs.additionalAssets.list.forEach((item) => {
      txOutputs.add(createChangeBox(changeAddress, height, item));
    });

    txOutputs.add(feeBox);

    const unsignedTx = new wasm.UnsignedTransaction(
      unsignedInputs,
      new wasm.DataInputs(),
      txOutputs,
    );

    return unsignedTransactionToProxy(
      unsignedTx,
      inputs.boxes.map((box) => box.to_js_eip12()),
    );
  };
