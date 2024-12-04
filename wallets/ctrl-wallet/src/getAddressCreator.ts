export const getAddressCreator = () => (): Promise<string> => {
  return new Promise((resolve, reject) => {
    window.xfi.bitcoin.request(
      { method: 'request_accounts', params: [] },
      (error: any, accounts: string[]) => {
        if (error) {
          console.error(error);
          return false;
        } else {
          console.log(`onFinish getAddress: ${JSON.stringify(accounts)}`);
          if (accounts.length > 0) {
            resolve(accounts[0]);
          } else reject();
        }
      },
    );
  });
};
