import { Contract } from 'ethers';

import type { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import type { Network, RosenAmountValue } from '@rosen-ui/types';

import { transferABI } from './constants';
import { generateLockData } from './utils';

export type GenerateLockTxParams = {
  amount: RosenAmountValue;
  bridgeFee: RosenAmountValue;
  fromAddress: string;
  fromChain: Network;
  lockAddress: string;
  networkFee: RosenAmountValue;
  toAddress: string;
  toChain: Network;
  token: RosenChainToken;
};

/**
 * generates the request of an EVM lock tx, ready to be passed to
 * `eth_sendTransaction`; the wallet fills in nonce, gas and chain id
 * @param getTokenMap
 * @returns
 */
export const generateLockTx =
  (getTokenMap: () => Promise<TokenMap>) =>
  async (
    params: GenerateLockTxParams,
  ): Promise<{
    to: string;
    from: string;
    data: string;
    value?: string;
  }> => {
    const rosenData = await generateLockData(
      params.toChain,
      params.toAddress,
      params.networkFee.toString(),
      params.bridgeFee.toString(),
    );

    const tokenMap = await getTokenMap();

    const unwrappedAmount = tokenMap.unwrapAmount(
      params.token.tokenId,
      params.amount,
      NETWORKS[params.fromChain].key,
    ).amount;

    if (params.token.type === 'native') {
      return {
        to: params.lockAddress,
        from: params.fromAddress,
        data: `0x${rosenData}`,
        value: `0x${unwrappedAmount.toString(16)}`,
      };
    }

    const contract = new Contract(params.token.tokenId, transferABI, undefined);

    const data = contract.interface.encodeFunctionData('transfer', [
      params.lockAddress,
      unwrappedAmount.toString(),
    ]);

    return {
      to: params.token.tokenId,
      from: params.fromAddress,
      data: data + rosenData,
    };
  };
