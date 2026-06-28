export const CONFIRMATION_TARGET = 6;
export const FIRO_TX_BASE_SIZE = 10;
export const FIRO_INPUT_SIZE = 148;
export const FIRO_OUTPUT_SIZE = 34;
export const MINIMUM_UTXO_VALUE = 500000n; // 0.005 FIRO in sats
export const FIRO_NETWORK = {
  messagePrefix: '\x18Firo Signed Message:\n',
  bech32: 'firo',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x52,
  scriptHash: 0x07,
  wif: 0xd2,
};
