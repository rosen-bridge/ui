export interface UnsignedPsbtData {
  psbt: string;
  signInputs: Record<string, number[]>;
}

export interface TokenInfo {
  id: string;
  value: bigint;
}

export interface AssetBalance {
  nativeToken: bigint;
  tokens: Array<TokenInfo>;
}

export type TxOutputRune = {
  address: string;
  vout: number;
  runeId: string;
  runeAmount: string;
};

export interface UnisatResponse<Data> {
  code: number;
  msg?: string;
  data: Data;
}

export interface UnisatAddressRunesUtxos {
  utxo: UnisatRunesUtxo[];
  height: number;
  start: number;
  total: number;
}

export interface UnisatRunesUtxo {
  height: number;
  confirmations: number;
  address: string;
  satoshi: number;
  scriptPk: string;
  txid: string;
  vout: number;
  runes: UnisatRunesDetail[];
}

export interface UnisatRunesDetail {
  rune: string;
  runeid: string;
  spacedRune: string;
  amount: string;
  symbol: string;
  divisibility: number;
}

export interface UnisatPage {
  cursor: number;
  total: number;
}

export interface UnisatAddressAvailableBtcUtxos extends UnisatPage {
  utxo: UnisatAddressAvailableBtcUtxo[];
}

export interface UnisatAddressBtcUtxos extends UnisatPage {
  totalConfirmed: number;
  totalUnconfirmed: number;
  totalUnconfirmedSpend: number;
  utxo: UnisatBtcUtxo[];
}

export interface UnisatBtcUtxo {
  txid: string;
  vout: number;
  satoshi: number;
  scriptType: string;
  scriptPk: string;
  codeType: number;
  address: string;
  height: number;
  idx: number;
  isOpInRBF: boolean;
  isSpent: boolean;
  inscriptionsCount: number;
  inscriptions: UnisatInscriptionItem[];
}

export interface UnisatAddressAvailableBtcUtxo extends UnisatBtcUtxo {
  confirmations: number;
}

export interface UnisatInscriptionItem {
  inscriptionId: string;
  inscriptionNumber: number;
  isBRC20: boolean;
  moved: boolean;
  offset: number;
}

export interface Status {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

export interface EsploraUtxo {
  txid: string;
  vout: number;
  status: Status;
  value: number;
}
