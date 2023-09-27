export const connectWallet = async () => {
  const granted = await cardano.nami?.enable();

  if (!granted) {
    console.error('Failed to connect!');
    return false;
  }
  return true;
};
