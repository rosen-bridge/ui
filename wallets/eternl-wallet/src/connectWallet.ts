/**
 * handles the Eternl wallet connection
 */

export const connectWallet = async (): Promise<boolean> => {
  const granted = await cardano.eternl?.enable();

  if (!granted) {
    console.error('Failed to connect!');
    return false;
  }
  return true;
};
