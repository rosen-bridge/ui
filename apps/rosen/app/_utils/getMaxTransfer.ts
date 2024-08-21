import { BitcoinNetwork, CardanoNetwork, ErgoNetwork } from '@/_types/network';

/**
 * return max transfer, considering all the context that affects it
 * @param network
 * @param tokenInfo CONTAINS A WRAPPED-VALUE
 * @param context
 * @returns THIS IS A WRAPPED-VALUE
 */
const getMaxTransfer = async (
  network: ErgoNetwork | CardanoNetwork | BitcoinNetwork,
  tokenInfo: {
    balance: number;
    isNative: boolean;
  },
  getContext: () => Promise<{
    fromAddress: string;
    toAddress: string;
    toChain: string;
  }>,
) => {
  if (network.name === 'bitcoin') {
    const context = await getContext();
    return await network.getMaxTransfer({
      balance: tokenInfo.balance,
      isNative: tokenInfo.isNative,
      eventData: {
        fromAddress: context.fromAddress,
        toAddress: context.toAddress,
        toChain: context.toChain,
      },
    });
  }

  return await network.getMaxTransfer({
    balance: tokenInfo.balance,
    isNative: tokenInfo.isNative,
  });
};

export default getMaxTransfer;
