import { In, Repository } from '@rosen-bridge/extended-typeorm';
import {
  AggregateEventStatus,
  AggregateTxStatus,
  AggregatedStatusEntity,
} from '@rosen-ui/public-status';

class AggregatedStatusAction {
  private static instance?: AggregatedStatusAction;

  protected constructor() {}

  /**
   * initialize AggregatedStatusAction
   */
  static init = () => {
    AggregatedStatusAction.instance = new AggregatedStatusAction();
  };

  /**
   * get AggregatedStatusAction instance or throw
   * @returns AggregatedStatusAction instance
   */
  static getInstance = () => {
    if (!AggregatedStatusAction.instance)
      throw Error(
        `AggregatedStatusAction should have been initialized before getInstance`,
      );
    return AggregatedStatusAction.instance;
  };

  /**
   * retrieves one AggregatedStatusEntity
   * @param repository
   * @param triggerTxId
   * @returns a promise that resolves to an AggregatedStatusEntity or null if no matching entity is found
   */
  getOne = async (
    repository: Repository<AggregatedStatusEntity>,
    triggerTxId: string,
  ): Promise<AggregatedStatusEntity | null> => {
    return repository.findOne({
      where: { triggerTxId },
      relations: ['tx'],
    });
  };

  /**
   * retrieves multiple AggregatedStatusEntity
   * note: no need for pagination since output.length == triggerTxIds.length
   * @param repository
   * @param triggerTxIds
   * @returns a promise that resolves to an array of AggregatedStatusEntity objects
   */
  getMany = async (
    repository: Repository<AggregatedStatusEntity>,
    triggerTxIds: string[],
  ): Promise<AggregatedStatusEntity[]> => {
    return repository.find({
      where: {
        triggerTxId: In(triggerTxIds),
      },
      relations: ['tx'],
      order: { triggerTxId: 'ASC' },
    });
  };

  /**
   * upserts an AggregatedStatusEntity into database if it differs from its stored value
   * @param repository
   * @param eventId
   * @param triggerTxId
   * @param updatedAt
   * @param status
   * @param txStatus
   * @param tx
   * @returns a promise that resolves to void
   */
  upsertOne = async (
    repository: Repository<AggregatedStatusEntity>,
    eventId: string,
    triggerTxId: string,
    updatedAt: number,
    status: AggregateEventStatus,
    txStatus?: AggregateTxStatus,
    tx?: {
      txId: string;
      chain: string;
    },
  ): Promise<void> => {
    const storedValue = await this.getOne(repository, triggerTxId);

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
          triggerTxId,
          updatedAt,
          status,
          txStatus: txStatus ?? null,
          tx: tx ? { txId: tx.txId, chain: tx.chain } : null,
        },
      ],
      ['triggerTxId'],
    );
  };
}

export default AggregatedStatusAction;
