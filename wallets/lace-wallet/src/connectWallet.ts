/**
 * handles the Lace wallet connection
 */

export const connectWallet = async () => {
  const granted = await window.cardano.lace?.enable();

  if (!granted) {
    console.error('Failed to connect!');
    return false;
  }
  return true;
};
