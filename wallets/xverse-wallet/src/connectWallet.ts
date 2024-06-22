import { AddressPurpose, BitcoinNetworkType, getAddress } from 'sats-connect';

export const connectWallet = async (): Promise<boolean> => {
  try {
    await getAddress({
      payload: {
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
        message: '',
        purposes: [AddressPurpose.Payment],
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onFinish: () => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onCancel: () => {},
    });
    return true;
  } catch {
    return false;
  }
};
