interface ErgoCalculatorInterface extends CalculatorInterface {
  explorerUrl: string;
}

interface CardanoCalculatorInterface extends CalculatorInterface {
  koiosUrl?: string;
  authToken?: string;
}
interface BitcoinCalculatorInterface extends CalculatorInterface {
  esploraUrl?: string;
}

/** Authenticated, read-only native BCH balance source; no browser RPC transport. */
interface BitcoinCashBalanceProvider {
  /**
   * Returns confirmed native assets after verifying the configured BCH chain.
   * @param address Canonical native mainnet treasury CashAddr.
   * @returns Exact native satoshis and an empty token list.
   */
  getAddressAssets(address: string): Promise<{
    nativeToken: bigint;
    tokens: readonly unknown[];
  }>;
}

/** Explicit opt-in configuration; the provider owns endpoint authentication. */
interface BitcoinCashCalculatorInterface extends CalculatorInterface {
  provider: BitcoinCashBalanceProvider;
}
interface BitcoinRunesCalculatorInterface extends CalculatorInterface {
  unisatUrl?: string;
  unisatApiKey?: string;
}

interface DogeCalculatorInterface extends CalculatorInterface {
  blockcypherUrl: string;
}

interface FiroCalculatorInterface extends CalculatorInterface {
  explorerUrl?: string;
}

interface EvmCalculatorInterface extends CalculatorInterface {
  rpcUrl: string;
  authToken?: string;
}

interface HandshakeCalculatorInterface extends CalculatorInterface {
  rpcUrl: string;
}

interface CalculatorInterface {
  addresses: string[];
}

export type {
  BitcoinCalculatorInterface,
  BitcoinCashBalanceProvider,
  BitcoinCashCalculatorInterface,
  BitcoinRunesCalculatorInterface,
  CardanoCalculatorInterface,
  DogeCalculatorInterface,
  ErgoCalculatorInterface,
  EvmCalculatorInterface,
  FiroCalculatorInterface,
  HandshakeCalculatorInterface,
};
