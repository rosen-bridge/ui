/**
 * handles the Nami wallet connection
 */

export const connectWallet = async () => {
  const granted = await window.cardano.nami?.enable();

  if (!granted) {
    console.error('Failed to connect!');
    return false;
  }
  return true;
};
