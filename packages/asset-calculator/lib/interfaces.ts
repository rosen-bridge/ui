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

interface CalculatorInterface {
  addresses: string[];
}

export {
  ErgoCalculatorInterface,
  CardanoCalculatorInterface,
  BitcoinCalculatorInterface,
};
