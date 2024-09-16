import { RosenAmountValue } from '@rosen-ui/types';
import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { Networks } from '@rosen-ui/constants';
import { ETH, transferABI } from './constants';
import { Contract } from 'ethers';

/**
 * generates ethereum lock tx
 * @param tokenId
 * @param lockAddress
 * @param fromAddress
 * @param amount
 * @param rosenData
 * @returns
 */
export const generateTxParametersCore = async (
  tokenId: string,
  lockAddress: string,
  fromAddress: string,
  amount: RosenAmountValue,
  rosenData: string
) => {
  let transactionParameters;
  if (tokenId === ETH) {
    transactionParameters = {
      to: lockAddress,
      from: fromAddress,
      data: '0x' + rosenData,
      value: amount,
    };
  } else {
    const contract = new Contract(tokenId, transferABI, undefined);
    const data = contract.interface.encodeFunctionData('transfer', [
      lockAddress,
      amount.toString(),
    ]);

    transactionParameters = {
      to: tokenId,
      from: fromAddress,
      data: data + rosenData,
    };
  }

  return transactionParameters;
};

export const generateTxParameters = (tokenMap: TokenMap) => {
  return (
    tokenId: string,
    lockAddress: string,
    fromAddress: string,
    wrappedAmount: RosenAmountValue,
    rosenData: string,
    token: RosenChainToken
  ) => {
    const unwrappedAmount = tokenMap.unwrapAmount(
      token[tokenMap.getIdKey(Networks.ETHEREUM)],
      wrappedAmount,
      Networks.ETHEREUM
    ).amount;
    return generateTxParametersCore(
      tokenId,
      lockAddress,
      fromAddress,
      unwrappedAmount,
      rosenData
    );
  };
};
