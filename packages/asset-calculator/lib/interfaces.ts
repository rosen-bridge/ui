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
interface BitcoinRunesCalculatorInterface extends CalculatorInterface {
  unisatUrl?: string;
}

interface DogeCalculatorInterface extends CalculatorInterface {
  blockcypherUrl: string;
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

export {
  ErgoCalculatorInterface,
  CardanoCalculatorInterface,
  BitcoinCalculatorInterface,
  BitcoinRunesCalculatorInterface,
  EvmCalculatorInterface,
  DogeCalculatorInterface,
  HandshakeCalculatorInterface,
};
