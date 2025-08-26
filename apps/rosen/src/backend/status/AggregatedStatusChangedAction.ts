import { Repository } from '@rosen-bridge/extended-typeorm';
import {
  AggregateEventStatus,
  AggregateTxStatus,
  AggregatedStatusChangedEntity,
} from '@rosen-ui/public-status';

class AggregatedStatusChangedAction {
  private static instance?: AggregatedStatusChangedAction;

  protected constructor() {}

  /**
   * initialize AggregatedStatusChangedAction
   */
  static init = () => {
    AggregatedStatusChangedAction.instance =
      new AggregatedStatusChangedAction();
  };

  /**
   * get AggregatedStatusChangedAction instance or throw
   * @returns AggregatedStatusChangedAction instance
   */
  static getInstance = () => {
    if (!AggregatedStatusChangedAction.instance)
      throw Error(
        `AggregatedStatusChangedAction should have been initialized before getInstance`,
      );
    return AggregatedStatusChangedAction.instance;
  };

  /**
   * retrieves the most recent AggregatedStatusChangedEntity for a given eventId
   * @param repository
   * @param eventId
   * @returns a promise resolving to the most recent AggregatedStatusChangedEntity or null if no matching entity is found
   */
  getLast = async (
    repository: Repository<AggregatedStatusChangedEntity>,
    eventId: string,
  ): Promise<AggregatedStatusChangedEntity | null> => {
    return repository.findOne({
      where: { eventId },
      relations: ['tx'],
      order: { insertedAt: 'DESC' },
    });
  };

  /**
   * retrieves multiple AggregatedStatusChangedEntity objects for a given eventId (timeline)
   * @param repository
   * @param eventId
   * @param offset
   * @param limit
   * @returns a promise that resolves to an array of AggregatedStatusChangedEntity objects
   */
  getMany = async (
    repository: Repository<AggregatedStatusChangedEntity>,
    eventId: string,
    offset?: number,
    limit?: number,
  ): Promise<{ total: number; items: AggregatedStatusChangedEntity[] }> => {
    const [items, total] = await repository.findAndCount({
      where: { eventId },
      relations: ['tx'],
      order: { insertedAt: 'DESC' },
      ...(Number.isFinite(offset) ? { skip: offset } : {}),
      ...(Number.isFinite(limit) ? { take: limit } : {}),
    });

    return {
      items,
      total,
    };
  };

  /**
   * inserts a single AggregatedStatusChangedEntity record if it differs in status or transaction
   * information from its last value
   * @param repository
   * @param eventId
   * @param insertedAt
   * @param status
   * @param txStatus
   * @param tx
   * @returns a promise that resolves to void
   */
  insertOne = async (
    repository: Repository<AggregatedStatusChangedEntity>,
    eventId: string,
    insertedAt: number,
    status: AggregateEventStatus,
    txStatus?: AggregateTxStatus,
    tx?: {
      txId: string;
      chain: string;
    },
  ): Promise<void> => {
    const lastValue = await this.getLast(repository, eventId);

    if (
      lastValue &&
      status === lastValue.status &&
      txStatus === lastValue.txStatus &&
      tx?.txId === lastValue.tx?.txId &&
      tx?.chain === lastValue.tx?.chain
    ) {
      throw new Error('aggregated_status_not_changed');
    }

    await repository.insert({
      eventId,
      insertedAt,
      status,
      txStatus: txStatus ?? null,
      tx: tx ? { txId: tx.txId, chain: tx.chain } : null,
    });
  };
}

export default AggregatedStatusChangedAction;
