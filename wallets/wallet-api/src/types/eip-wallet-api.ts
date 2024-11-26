import {
  Paging,
  TokenId,
  BoxId,
  TxId,
  NErg,
  Address,
  ErgoBoxProxy,
  TokenAmountProxy,
  Registers,
  ErgoTree,
  ErgoTxProxy,
  DataInput,
  Input,
  ContextExtension,
  ErgoBoxCandidateProxy,
} from '../types';

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

/**
 * erog wallets interface
 */
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
