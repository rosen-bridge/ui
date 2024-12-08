/**
 * handles the OKX wallet connection
 */
export const connectWallet = async (): Promise<boolean> => {
  try {
    await window.okxwallet.bitcoin.connect();
    return true;
  } catch {
    return false;
  }
};
