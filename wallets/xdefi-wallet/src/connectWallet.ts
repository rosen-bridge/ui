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
      onFinish: () => {},
      onCancel: () => {},
    });
    return true;
  } catch {
    return false;
  }
};
