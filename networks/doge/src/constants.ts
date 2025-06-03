export const CONFIRMATION_TARGET = 10;
export const DOGE_TX_BASE_SIZE = 10;
export const DOGE_INPUT_SIZE = 148;
export const DOGE_OUTPUT_SIZE = 34;
export const MINIMUM_UTXO_VALUE = 1000000; // Minimum Dogecoin UTXO value in satoshis
export const DOGE_NETWORK = {
  // Doge network parameters
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bech32: 'dc',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398,
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e,
};
