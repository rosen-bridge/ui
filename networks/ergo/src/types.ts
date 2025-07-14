export interface TokenInfo {
  id: string;
  value: bigint;
}

export interface AssetBalance {
  nativeToken: bigint;
  tokens: Array<TokenInfo>;
}

export interface BoxInfo {
  id: string;
  assets: AssetBalance;
}

export interface CoveringBoxes {
  covered: boolean;
  boxes: Array<ErgoBoxProxy>;
}

export type BoxId = HexString;
export type TxId = HexString;
export type HexString = string;
export type TokenId = HexString;
export type NErg = bigint;
export type Base58String = string;
export type Address = Base58String;
export type Paging = {
  offset: number;
  limit: number;
};

export type ErgoBoxProxy = {
  readonly boxId: BoxId;
  readonly transactionId: TxId;
  readonly index: number;
  readonly ergoTree: ErgoTree;
  readonly creationHeight: number;
  readonly value: string;
  readonly assets: TokenAmountProxy[];
  readonly additionalRegisters: Registers;
};

export declare type ErgoBoxCandidateProxy = {
  readonly value: string;
  readonly ergoTree: ErgoTree;
  readonly creationHeight: number;
  readonly assets: TokenAmountProxy[];
  readonly additionalRegisters: Registers;
};

export type ErgoTree = HexString;

export type ErgoTxProxy = {
  readonly id: TxId;
  readonly inputs: Input[];
  readonly dataInputs: DataInput[];
  readonly outputs: ErgoBoxProxy[];
  readonly size: number;
};

export type Input = {
  readonly boxId: BoxId;
  readonly spendingProof: ProverResult;
};

export type DataInput = {
  readonly boxId: BoxId;
};

export type ContextExtension = {
  [key: string]: HexString;
};

export type ProverResult = {
  readonly proof: Uint8Array;
  readonly extension: ContextExtension;
};

export type Registers = {
  [key: string]: HexString;
};

export type TokenAmountProxy = {
  readonly tokenId: TokenId;
  readonly amount: string;
  readonly name?: string;
  readonly decimals?: number;
};

export type UnsignedInputProxy = {
  readonly boxId: BoxId;
  readonly transactionId: TxId;
  readonly index: number;
  readonly ergoTree: ErgoTree;
  readonly creationHeight: number;
  readonly value: string;
  readonly assets: TokenAmountProxy[];
  readonly additionalRegisters: Registers;
  readonly extension: ContextExtension;
};

export type UnsignedErgoTxProxy = {
  readonly inputs: UnsignedInputProxy[];
  readonly dataInputs: DataInput[];
  readonly outputs: ErgoBoxCandidateProxy[];
};

export interface EipWalletApi {
  request_read_access: () => Promise<boolean>;

  check_read_access: () => boolean;

  get_utxos: (
    amount?: NErg,
    token_id?: TokenId,
    paginate?: Paging,
  ) => Promise<ErgoBoxProxy[] | undefined>;

  get_balance: (token_id: TokenId) => Promise<string>;

  get_used_addresses: (paginate?: Paging) => Promise<Address[]>;

  get_change_address: () => Promise<Address>;

  get_unused_addresses: () => Promise<Address[]>;

  sign_tx: (tx: UnsignedErgoTxProxy) => Promise<ErgoTxProxy>;

  sign_tx_input: (tx: UnsignedErgoTxProxy, index: number) => Promise<Input>;

  sign_data: (addr: Address, message: string) => Promise<string>;

  submit_tx: (tx: ErgoTxProxy) => Promise<TxId>;

  add_external_box: (box_id: BoxId) => boolean;
}
