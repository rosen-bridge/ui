import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { Contract } from 'ethers';

import { transferABI } from './constants';

/**
 * generates ethereum lock tx
 * @param tokenMap
 * @returns
 */
export const generateTxParameters =
  (tokenMap: TokenMap) =>
  async (
    tokenId: string,
    lockAddress: string,
    fromAddress: string,
    wrappedAmount: RosenAmountValue,
    rosenData: string,
    token: RosenChainToken,
  ) => {
    const unwrappedAmount = tokenMap.unwrapAmount(
      token[tokenMap.getIdKey(NETWORKS.ETHEREUM)],
      wrappedAmount,
      NETWORKS.ETHEREUM,
    ).amount;

    let transactionParameters;
    if (token.metaData.type === 'native') {
      transactionParameters = {
        to: lockAddress,
        from: fromAddress,
        data: '0x' + rosenData,
        value: unwrappedAmount.toString(16),
      };
    } else {
      const contract = new Contract(tokenId, transferABI, undefined);
      const data = contract.interface.encodeFunctionData('transfer', [
        lockAddress,
        unwrappedAmount.toString(),
      ]);

      transactionParameters = {
        to: tokenId,
        from: fromAddress,
        data: data + rosenData,
      };
    }

    return transactionParameters;
  };
