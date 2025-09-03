import { Network, RosenAmountValue } from '@rosen-ui/types';

export const getMaxTransferCreator =
  () =>
  async ({
    balance,
    eventData,
  }: {
    balance: RosenAmountValue;
    eventData: {
      toChain: Network;
      fromAddress: string;
      toAddress: string;
    };
  }) => {
    if (!eventData.toAddress) return 0n;
    return balance;
  };
