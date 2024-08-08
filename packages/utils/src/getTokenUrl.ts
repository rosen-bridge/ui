const baseTokenURLs = {
  ergo: 'https://explorer.ergoplatform.com/en/token',
  cardano: 'https://cardanoscan.io/token',
  bitcoin: '',
};

export const getTokenUrl = (network: string, tokenId?: string) => {
  const baseURL = baseTokenURLs[network as keyof typeof baseTokenURLs];

  if (!baseURL || !tokenId) return null;

  return `${baseURL}/${tokenId}`;
};
