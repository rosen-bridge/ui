export interface Status {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

export interface DogeUtxo {
  txId: string;
  index: number;
  value: bigint;
}

// BlockCypher types that match our needs
export interface BlockCypherAddress {
  address: string;
  total_received: number;
  total_sent: number;
  balance: number;
  unconfirmed_balance: number;
  final_balance: number;
  n_tx: number;
  unconfirmed_n_tx: number;
  final_n_tx: number;
  txrefs: BlockCypherTxRef[];
}

export interface BlockCypherTxRef {
  tx_hash: string;
  block_height: number;
  tx_input_n: number;
  tx_output_n: number;
  value: number;
  ref_balance: number;
  spent: boolean;
  confirmations: number;
  confirmed: string;
  double_spend: boolean;
}

export interface UnsignedPsbtData {
  psbt: {
    base64: string;
    hex: string;
  };
  inputSize: number;
}
