import { request } from 'sats-connect';

export const connectWallet = async (): Promise<boolean> => {
  try {
    const response1 = await request('getBalance', undefined);

    if (response1.status === 'success') return true;

    const response2 = await request('wallet_requestPermissions', undefined);

    return response2.status === 'success';
  } catch {
    return false;
  }
};
