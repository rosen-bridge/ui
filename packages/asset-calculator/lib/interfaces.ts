interface ErgoCalculatorInterface {
  calculatorAddresses: string[];
  explorerUrl: string;
}

interface CardanoCalculatorInterface {
  calculatorAddresses: string[];
  koiosUrl: string;
  authToken?: string;
}

export { ErgoCalculatorInterface, CardanoCalculatorInterface };
