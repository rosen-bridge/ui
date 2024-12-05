export const getAddressCreator = () => (): Promise<string> => {
  return window.okxwallet.bitcoin
    .getAccounts()
    .then((accounts: string[]) =>
      accounts.find((account) => account.startsWith('bc1q')),
    );
};
