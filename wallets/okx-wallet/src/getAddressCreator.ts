export const getAddressCreator = () => (): Promise<string> => {
  return window.okxwallet.bitcoin
    .getAccounts()
    .then((accounts: string[]) => accounts[0]);
};
