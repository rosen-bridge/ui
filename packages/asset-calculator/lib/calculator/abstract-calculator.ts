import { RosenChainToken } from '@rosen-bridge/tokens';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

export default abstract class AbstractCalculator {
  constructor(
    protected readonly addresses: string[],
    protected readonly logger: AbstractLogger = new DummyLogger()
  ) {}

  /**
   * returns total supply of a specific token in this network
   */
  abstract totalSupply: (token: RosenChainToken) => Promise<bigint>;

  /**
   * returns total balance of a specific token in this network (hot + cold)
   */
  abstract totalBalance: (token: RosenChainToken) => Promise<bigint>;

  /**
   * returns locked amounts of a specific token for different addresses
   */
  abstract getLockedAmountsPerAddress: (
    token: RosenChainToken
  ) => Promise<{ address: string; amount: bigint }[]>;
}
