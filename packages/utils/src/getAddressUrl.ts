const baseAddressURLs = {
  ergo: 'https://explorer.ergoplatform.com/en/addresses',
  cardano: 'https://cardanoscan.io/address',
  bitcoin: 'https://mempool.space/address',
};

export const getAddressUrl = (network: string, address?: string) => {
  const baseURL = baseAddressURLs[network as keyof typeof baseAddressURLs];

  if (!baseURL || !address) return null;

  return `${baseURL}/${address}`;
};
