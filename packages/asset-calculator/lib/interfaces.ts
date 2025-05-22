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
interface RunesCalculatorInterface extends CalculatorInterface {
  unisatUrl?: string;
}

interface EvmCalculatorInterface extends CalculatorInterface {
  rpcUrl: string;
  authToken?: string;
}

interface CalculatorInterface {
  addresses: string[];
}

export {
  ErgoCalculatorInterface,
  CardanoCalculatorInterface,
  BitcoinCalculatorInterface,
  RunesCalculatorInterface,
  EvmCalculatorInterface,
};
