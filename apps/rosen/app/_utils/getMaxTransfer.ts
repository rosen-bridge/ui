import { BitcoinNetwork, CardanoNetwork, ErgoNetwork } from '@/_types/network';

/**
 * return max transfer, considering all the context that affects it
 * @param network
 * @param tokenInfo
 * @param context
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
    return network.getMaxTransfer({
      balance: tokenInfo.balance,
      isNative: tokenInfo.isNative,
      eventData: {
        fromAddress: context.fromAddress,
        toAddress: context.toAddress,
        toChain: context.toChain,
      },
    });
  }

  return network.getMaxTransfer({
    balance: tokenInfo.balance,
    isNative: tokenInfo.isNative,
  });
};

export default getMaxTransfer;
