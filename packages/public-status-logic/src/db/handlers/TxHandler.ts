import { Repository } from 'typeorm';

import { TxType } from '../../constants';
import { TxEntity } from '../entities/TxEntity';

class TxHandler {
  private static instance?: TxHandler;

  protected constructor() {}

  /**
   * generates a TxHandler object if it doesn't exist
   * @returns TxHandler instance
   */
  public static getInstance = () => {
    if (!TxHandler.instance) {
      TxHandler.instance = new TxHandler();
    }
    return TxHandler.instance;
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

export default TxHandler;
