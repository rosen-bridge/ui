import { Repository } from 'typeorm';

import { TxType } from '../../constants';
import { TxEntity } from '../entities/TxEntity';

class TxAction {
  private static instance?: TxAction;

  protected constructor() {}

  /**
   * initialize TxAction
   */
  static init = async () => {
    TxAction.instance = new TxAction();
  };

  /**
   * get TxAction instance or throw
   * @returns TxAction instance
   */
  static getInstance = () => {
    if (!TxAction.instance)
      throw Error(`TxAction should have been initialized before getInstance`);
    return TxAction.instance;
  };

  /**
   * inserts a TxEntity into database or throw if it exists
   * @param txId
   * @param chain
   * @param eventId
   * @param insertedAt
   * @param txType
   * @returns a promise that resolves to void
   */
  insertOne = async (
    repository: Repository<TxEntity>,
    txId: string,
    chain: string,
    eventId: string,
    insertedAt: number,
    txType: TxType,
  ): Promise<void> => {
    const exists = await repository.findOneBy({
      txId,
      chain,
    });

    if (exists) throw new Error('tx_exists');

    await repository.insert({
      txId,
      chain,
      eventId,
      insertedAt,
      txType,
    });
  };
}

export default TxAction;
