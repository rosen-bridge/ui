export interface UnsignedPsbtData {
  psbt: {
    base64: string;
    hex: string;
  };
  inputSize: number;
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

export interface UnisatAddressBtcUtxos {
  cursor: number;
  total: number;
  utxo: UnisatBtcUtxo[];
}

export interface UnisatBtcUtxo {
  confirmations: number;
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

export interface UnisatInscriptionItem {
  inscriptionId: string;
  inscriptionNumber: number;
  isBRC20: boolean;
  moved: boolean;
  offset: number;
}
