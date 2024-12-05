import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';

export const getAddressCreator = () => (): Promise<string> => {
  return window.okxwallet.bitcoin.getAccounts().then((r: any) => r[0]);
};
