const baseTxURLs = {
  ergo: 'https://explorer.ergoplatform.com/en/token',
  cardano: 'https://cardanoscan.io/token',
  bitcoin: '',
};

export const getTokenUrl = (network: string, tokenId?: string) => {
  const baseURL = baseTxURLs[network as keyof typeof baseTxURLs];

  if (!baseURL || !tokenId) return null;

  return `${baseURL}/${tokenId}`;
};
