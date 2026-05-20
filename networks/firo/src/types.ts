export interface FiroUtxo {
  txId: string;
  index: number;
  value: bigint;
}

export interface UnsignedPsbtData {
  psbt: {
    base64: string;
    hex: string;
  };
  inputSize: number;
}
