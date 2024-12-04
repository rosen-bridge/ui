// import { AddressPurpose, BitcoinNetworkType, getAddress } from 'sats-connect';

export const connectWallet = async (): Promise<boolean> => {
  try {
    // Connect & get accounts
    window.xfi.bitcoin.request(
      { method: 'request_accounts', params: [] },
      (error: any, accounts: any) => {
        if (error) {
          console.error(error);
          return;
        } else {
          console.log('Account connected:', JSON.stringify(accounts));
        }
      },
    );
    return true;
  } catch {
    return false;
  }
};
