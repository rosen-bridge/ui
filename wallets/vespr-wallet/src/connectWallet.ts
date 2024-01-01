/**
 * handles the nami wallet connection
 */

export const connectWallet = async () => {
  const granted = await cardano.vespr?.enable();

  if (!granted) {
    console.error('Failed to connect!');
    return false;
  }
  return true;
};
