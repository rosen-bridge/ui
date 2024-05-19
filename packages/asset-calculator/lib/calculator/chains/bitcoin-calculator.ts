import AbstractCalculator from '../abstract-calculator';

export class BitcoinCalculator extends AbstractCalculator {
  /**
   * @param token Bitcoin chain token supply, always 0
   */
  totalSupply = async (): Promise<bigint> => {
    return 0n;
  };

  /**
   * @param token Bitcoin chain token balance, always 0
   */
  totalBalance = async (): Promise<bigint> => {
    return 0n;
  };
}
