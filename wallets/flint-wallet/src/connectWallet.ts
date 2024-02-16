/**
 * handles the Flint wallet connection
 */

export const connectWallet = async () => {
  const granted = await cardano.flint?.enable();

  if (!granted) {
    console.error('Failed to connect!');
    return false;
  }
  return true;
};
