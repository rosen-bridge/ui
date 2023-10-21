import { ConnectorContextApi } from '../../bridges';

/**
 * search the wallet and return the balance for
 * the requested token
 */

export const getBalance = async (context: ConnectorContextApi) => {
  const rawValue = await context.getBalance();
  return rawValue;
};
