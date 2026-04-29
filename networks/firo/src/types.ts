export interface FiroUtxo {
  txId: string;
  index: number;
  value: bigint;
}

export interface FiroRpcError {
  code: number;
  message: string;
}

export interface FiroRpcResponse<T> {
  result: T;
  error: FiroRpcError | null;
  id: string;
}

export interface FiroRpcUtxo {
  address: string;
  txid: string;
  outputIndex: number;
  script: string;
  satoshis: number;
  height: number;
}

export interface FiroRpcBalance {
  balance: number;
  received: number;
}

export interface FiroRpcSmartFee {
  feerate?: number;
  errors?: string[];
  blocks?: number;
}

export interface FiroRpcNetworkInfo {
  relayfee?: number;
}

export interface UnsignedPsbtData {
  psbt: {
    base64: string;
    hex: string;
  };
  inputSize: number;
}
