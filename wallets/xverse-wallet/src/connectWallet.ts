import Wallet, { AddressPurpose } from 'sats-connect';

export const connectWallet = async (): Promise<boolean> => {
  try {
    const response = await Wallet.request('getAccounts', {
      purposes: [AddressPurpose.Payment],
      message: 'Cool app wants to know your addresses!',
    });

    if (response.status === 'success') {
      localStorage.setItem('TEST', JSON.stringify(response.result));
    }

    return true;
  } catch {
    return false;
  }
};
