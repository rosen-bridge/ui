const baseTxURLs = {
  ergo: 'https://explorer.ergoplatform.com/en/addresses',
  cardano: 'https://cardanoscan.io/address',
  bitcoin: 'https://www.blockchain.com/explorer/addresses/btc',
};

export const getAddressUrl = (network: string, address?: string) => {
  const baseURL = baseTxURLs[network as keyof typeof baseTxURLs];

  if (!baseURL || !address) return null;

  return `${baseURL}/${address}`;
};
