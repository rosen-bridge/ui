interface ErgoCalculatorInterface extends CalculatorInterface {
  explorerUrl: string;
}

interface CardanoCalculatorInterface extends CalculatorInterface {
  koiosUrl?: string;
  authToken?: string;
}

interface CalculatorInterface {
  addresses: string[];
}

export { ErgoCalculatorInterface, CardanoCalculatorInterface };
