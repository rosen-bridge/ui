import { RosenChainToken, TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { Network } from '@rosen-ui/types';

export default abstract class AbstractCalculator {
  abstract readonly chain: Network;

  constructor(
    protected readonly addresses: string[],
    protected readonly logger: AbstractLogger = new DummyLogger(),
    protected tokenMap: TokenMap
  ) {}

  get idKey() {
    return this.tokenMap.getIdKey(this.chain);
  }

  abstract totalRawSupply: (token: RosenChainToken) => Promise<bigint>;

  /**
   * returns total supply of a specific token in this network
   */
  totalSupply = async (token: RosenChainToken): Promise<bigint> => {
    return this.tokenMap.wrapAmount(
      token[this.idKey],
      await this.totalRawSupply(token),
      this.chain
    ).amount;
  };

  abstract totalRawBalance: (token: RosenChainToken) => Promise<bigint>;

  /**
   * returns total balance of a specific token in this network (hot + cold)
   */
  totalBalance = async (token: RosenChainToken): Promise<bigint> => {
    return this.tokenMap.wrapAmount(
      token[this.idKey],
      await this.totalRawBalance(token),
      this.chain
    ).amount;
  };

  /**
   * returns locked amounts of a specific token for different addresses
   */
  abstract getRawLockedAmountsPerAddress: (
    token: RosenChainToken
  ) => Promise<{ address: string; amount: bigint }[]>;

  getLockedAmountsPerAddress = async (
    token: RosenChainToken
  ): Promise<{ address: string; amount: bigint }[]> => {
    const amounts = await this.getRawLockedAmountsPerAddress(token);
    return amounts.map((amount) => ({
      address: amount.address,
      amount: this.tokenMap.wrapAmount(
        token[this.idKey],
        amount.amount,
        this.chain
      ).amount,
    }));
  };
}
