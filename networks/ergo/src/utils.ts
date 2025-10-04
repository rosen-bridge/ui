import ergoExplorerClientFactory from '@rosen-clients/ergo-explorer';
import {
  CalculateFee,
  calculateFeeCreator,
  getMinTransferCreator as getMinTransferCreatorBase,
} from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';
import * as wasm from 'ergo-lib-wasm-nodejs';

import { minBoxValue } from './constants';
import {
  AssetBalance,
  BoxInfo,
  CoveringBoxes,
  ErgoBoxProxy,
  TokenInfo,
} from './types';

/**
 * gets Ergo current block height
 * @returns
 */
export const getHeight = async (): Promise<number> => {
  const explorerClient = ergoExplorerClientFactory(
    'https://api.ergoplatform.com',
  );
  return Number((await explorerClient.v1.getApiV1Networkstate()).height);
};

/**
 * creates lock box candidate
 * @param lockAddress
 * @param height
 * @param tokenId
 * @param amount THIS IS AN UNWRAPPED-VALUE
 * @param toChain
 * @param toAddress
 * @param fromAddress
 * @param bridgeFee
 * @param networkFee
 */
export const createLockBox = (
  lockAddress: string,
  height: number,
  tokenId: string,
  amount: bigint,
  toChain: Network,
  toAddress: string,
  fromAddress: string,
  bridgeFee: bigint,
  networkFee: bigint,
): wasm.ErgoBoxCandidate => {
  /**
   * TODO: fix ergo native token id
   * local:ergo/rosen-bridge/ui#100
   */
  const boxErgValue = tokenId === 'erg' ? amount : minBoxValue;
  const lockBox = new wasm.ErgoBoxCandidateBuilder(
    wasm.BoxValue.from_i64(wasm.I64.from_str(boxErgValue.toString())),
    wasm.Contract.pay_to_address(wasm.Address.from_base58(lockAddress)),
    height,
  );

  lockBox.set_register_value(
    wasm.NonMandatoryRegisterId.R4,
    wasm.Constant.from_coll_coll_byte([
      Buffer.from(toChain.toString()),
      Buffer.from(toAddress.toString()),
      Buffer.from(networkFee.toString()),
      Buffer.from(bridgeFee.toString()),
      Buffer.from(fromAddress.toString()),
    ]),
  );

  /**
   * TODO: fix ergo native token id
   * local:ergo/rosen-bridge/ui#100
   */
  if (tokenId !== 'erg') {
    lockBox.add_token(
      wasm.TokenId.from_str(tokenId),
      wasm.TokenAmount.from_i64(wasm.I64.from_str(amount.toString())),
    );
  }
  return lockBox.build();
};

/**
 * creates change box candidate
 *
 * THIS FUNCTION WORKS WITH UNWRAPPED VALUES
 *
 * @param changeAddress
 * @param height
 * @param balance
 * @returns
 */
export const createChangeBox = (
  changeAddress: string,
  height: number,
  balance: AssetBalance,
): wasm.ErgoBoxCandidate => {
  const changeBox = new wasm.ErgoBoxCandidateBuilder(
    wasm.BoxValue.from_i64(wasm.I64.from_str(balance.nativeToken.toString())),
    wasm.Contract.pay_to_address(wasm.Address.from_base58(changeAddress)),
    height,
  );

  balance.tokens.forEach((token) => {
    changeBox.add_token(
      wasm.TokenId.from_str(token.id),
      wasm.TokenAmount.from_i64(wasm.I64.from_str(token.value.toString())),
    );
  });
  return changeBox.build();
};

/**
 * extracts box id and assets of a box
 *
 * THIS FUNCTION WORKS WITH UNWRAPPED VALUES
 *
 * @param box the box
 * @returns an object containing the box id and assets
 */
const getBoxInfo = (box: ErgoBoxProxy): BoxInfo => {
  return {
    id: box.boxId,
    assets: {
      nativeToken: BigInt(box.value),
      tokens: box.assets.map((token) => ({
        id: token.tokenId,
        value: BigInt(token.amount),
      })),
    },
  };
};

/**
 * select useful boxes for an address until required assets are satisfied
 *
 * THIS FUNCTION WORKS WITH UNWRAPPED VALUES
 *
 * @param address the address
 * @param requiredAssets the required assets
 * @param forbiddenBoxIds the id of forbidden boxes
 * @param trackMap the mapping of a box id to it's next box
 * @returns an object containing the selected boxes with a boolean showing if requirements covered or not
 */
export const getCoveringBoxes = async (
  requiredAssets: AssetBalance,
  forbiddenBoxIds: Array<string>,
  trackMap: Map<string, ErgoBoxProxy | undefined>,
  boxIterator: Iterator<ErgoBoxProxy, undefined>,
): Promise<CoveringBoxes> => {
  let uncoveredNativeToken = requiredAssets.nativeToken;
  const uncoveredTokens = requiredAssets.tokens.filter(
    (info) => info.value > 0n,
  );

  const isRequirementRemaining = () => {
    return uncoveredTokens.length > 0 || uncoveredNativeToken > 0n;
  };

  const result: Array<ErgoBoxProxy> = [];

  // get boxes until requirements are satisfied
  while (isRequirementRemaining()) {
    const iteratorResponse = boxIterator.next();

    // end process if there are no more boxes
    if (iteratorResponse.done) break;

    let trackedBox: ErgoBoxProxy | undefined = iteratorResponse.value;
    let boxInfo = getBoxInfo(trackedBox);

    // track boxes
    let skipBox = false;
    while (trackMap.has(boxInfo.id)) {
      trackedBox = trackMap.get(boxInfo.id);
      if (!trackedBox) {
        skipBox = true;
        break;
      }
      boxInfo = getBoxInfo(trackedBox);
    }

    // if tracked to no box or forbidden box, skip it
    if (skipBox || forbiddenBoxIds.includes(boxInfo.id)) {
      continue;
    }

    // check and add if box assets are useful to requirements
    let isUseful = false;
    boxInfo.assets.tokens.forEach((boxToken) => {
      const tokenIndex = uncoveredTokens.findIndex(
        (requiredToken) => requiredToken.id === boxToken.id,
      );
      if (tokenIndex !== -1) {
        isUseful = true;
        const token = uncoveredTokens[tokenIndex];
        if (token.value > boxToken.value) token.value -= boxToken.value;
        else uncoveredTokens.splice(tokenIndex, 1);
      }
    });
    if (isUseful || uncoveredNativeToken > 0n) {
      uncoveredNativeToken -=
        uncoveredNativeToken >= boxInfo.assets.nativeToken
          ? boxInfo.assets.nativeToken
          : uncoveredNativeToken;
      result.push(trackedBox!);
    }
  }

  return {
    covered: !isRequirementRemaining(),
    boxes: result,
  };
};

/**
 * sums two AssetBalance
 *
 * IT DOESN'T MATTER WHETHER THESE VALUES ARE WRAPPED OR UNWRAPPED;
 * WHAT TRULY MATTERS IS THE CONTEXT IN WHICH THIS FUNCTION IS USED.
 *
 * @param a first AssetBalance object
 * @param b second AssetBalance object
 * @returns aggregated AssetBalance
 */
export const sumAssetBalance = (
  a: AssetBalance,
  b: AssetBalance,
): AssetBalance => {
  // sum native token
  const nativeToken = a.nativeToken + b.nativeToken;
  const tokens: Array<TokenInfo> = [];

  // add all tokens to result
  [...a.tokens, ...b.tokens].forEach((token) => {
    const targetToken = tokens.find((item) => item.id === token.id);
    if (targetToken) targetToken.value += token.value;
    else tokens.push(structuredClone(token));
  });

  return {
    nativeToken,
    tokens,
  };
};

/**
 * subtracts two AssetBalance
 *
 * IT DOESN'T MATTER WHETHER THESE VALUES ARE WRAPPED OR UNWRAPPED;
 * WHAT TRULY MATTERS IS THE CONTEXT IN WHICH THIS FUNCTION IS USED.
 *
 * @param a first AssetBalance object
 * @param b second AssetBalance object
 * @param minimumNativeToken minimum allowed native token
 * @param allowNegativeNativeToken if true, sets nativeToken as 0 instead of throwing error
 * @returns reduced AssetBalance
 */
export const subtractAssetBalance = (
  a: AssetBalance,
  b: AssetBalance,
  minimumNativeToken = 0n,
  allowNegativeNativeToken = false,
): AssetBalance => {
  // sum native token
  let nativeToken = 0n;
  if (a.nativeToken > b.nativeToken + minimumNativeToken)
    nativeToken = a.nativeToken - b.nativeToken;
  else if (allowNegativeNativeToken) nativeToken = 0n;
  else
    throw new Error(
      `Cannot reduce native token: [${a.nativeToken.toString()}] is less than [${b.nativeToken.toString()} + ${minimumNativeToken.toString()}]`,
    );

  // reduce all `b` tokens
  const tokens = structuredClone(a.tokens);
  b.tokens.forEach((token) => {
    const index = tokens.findIndex((item) => item.id === token.id);
    if (index !== -1) {
      if (tokens[index].value > token.value) tokens[index].value -= token.value;
      else if (tokens[index].value === token.value) tokens.splice(index, 1);
      else
        throw new Error(
          `Cannot reduce token [${token.id}]: [${tokens[
            index
          ].value.toString()}] is less than [${token.value.toString()}]`,
        );
    } else
      throw new Error(`Cannot reduce token [${token.id}]: Token not found`);
  });

  return {
    nativeToken,
    tokens,
  };
};

/**
 * calculates box assets
 *
 * THIS FUNCTION WORKS WITH UNWRAPPED VALUES
 *
 * @param utxo
 * @returns
 */
export const getBoxAssets = (box: ErgoBoxProxy): AssetBalance => {
  return {
    nativeToken: BigInt(box.value),
    tokens: box.assets.map((token) => ({
      id: token.tokenId,
      value: BigInt(token.amount),
    })),
  };
};

export const calculateFee: CalculateFee = calculateFeeCreator(
  NETWORKS.ergo.key,
  getHeight,
);

export const getMinTransferCreator = getMinTransferCreatorBase(
  NETWORKS.ergo.key,
  calculateFee,
);
