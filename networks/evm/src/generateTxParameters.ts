import { TokenMap, RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { Network, RosenAmountValue } from '@rosen-ui/types';
import { Contract } from 'ethers';

import { transferABI } from './constants';

/**
 * generates ethereum lock tx
 * @param getTokenMap
 * @returns
 */
export const generateTxParameters =
  (getTokenMap: () => Promise<TokenMap>) =>
  async (
    tokenId: string,
    lockAddress: string,
    fromAddress: string,
    wrappedAmount: RosenAmountValue,
    rosenData: string,
    token: RosenChainToken,
    fromChain: Network,
  ) => {
    const tokenMap = await getTokenMap();

    const unwrappedAmount = tokenMap.unwrapAmount(
      token.tokenId,
      wrappedAmount,
      NETWORKS[fromChain].key,
    ).amount;

    let transactionParameters;
    if (token.type === 'native') {
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
