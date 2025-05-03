import { In, Repository } from 'typeorm';

import { AggregateEventStatus, AggregateTxStatus } from '../../constants';
import { AggregatedStatusEntity } from '../entities/AggregatedStatusEntity';

class AggregatedStatusHandler {
  private static instance?: AggregatedStatusHandler;

  protected constructor() {}

  /**
   * generates a AggregatedStatusHandler object if it doesn't exist
   * @returns AggregatedStatusHandler instance
   */
  public static getInstance = () => {
    if (!AggregatedStatusHandler.instance) {
      AggregatedStatusHandler.instance = new AggregatedStatusHandler();
    }
    return AggregatedStatusHandler.instance;
  };

  /**
   * retrieves one AggregatedStatusEntity matching the specified eventId
   * @param repository
   * @param eventId
   * @returns a promise that resolves to an AggregatedStatusEntity or null if no matching entity is found
   */
  getOne = async (
    repository: Repository<AggregatedStatusEntity>,
    eventId: string,
  ): Promise<AggregatedStatusEntity | null> => {
    return repository.findOne({
      where: { eventId },
      relations: ['tx'],
    });
  };

  /**
   * retrieves multiple AggregatedStatusEntity objects for the given eventIds array
   * @param repository
   * @param eventIds
   * @returns a promise that resolves to an array of AggregatedStatusEntity objects
   */
  getMany = async (
    repository: Repository<AggregatedStatusEntity>,
    eventIds: string[],
  ): Promise<AggregatedStatusEntity[]> => {
    return repository.find({
      where: { eventId: In(eventIds) },
      relations: ['tx'],
      order: { eventId: 'ASC' },
    });
  };

  /**
   * upserts an AggregatedStatusEntity into database if it differs from its stored value
   * @param repository
   * @param eventId
   * @param updatedAt
   * @param status
   * @param txStatus
   * @param tx
   * @returns a promise that resolves to void
   */
  upsertOne = async (
    repository: Repository<AggregatedStatusEntity>,
    eventId: string,
    updatedAt: number,
    status: AggregateEventStatus,
    txStatus: AggregateTxStatus,
    tx?: {
      txId: string;
      chain: string;
    },
  ): Promise<void> => {
    const storedValue = await this.getOne(repository, eventId);

    if (
      storedValue &&
      status === storedValue.status &&
      txStatus === storedValue.txStatus &&
      tx?.txId === storedValue.tx?.txId &&
      tx?.chain === storedValue.tx?.chain
    ) {
      return;
    }

    await repository.upsert(
      [
        {
          eventId,
          updatedAt,
          status,
          txStatus,
          tx: tx ? { txId: tx.txId, chain: tx.chain } : null,
        },
      ],
      ['eventId'],
    );
  };
}

export default AggregatedStatusHandler;
