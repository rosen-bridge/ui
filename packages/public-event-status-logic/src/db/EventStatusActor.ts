import { DataSource, Repository } from 'typeorm';

import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
  TxType,
} from '../constants';
import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
import { StatusChangedEntity } from './entities/StatusChangedEntity';

export class EventStatusActor {
  private static instance: EventStatusActor;
  dataSource: DataSource;
  statusChangedRepository: Repository<StatusChangedEntity>;
  guardStatusChangedRepository: Repository<GuardStatusChangedEntity>;

  protected constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.statusChangedRepository =
      this.dataSource.getRepository(StatusChangedEntity);
    this.guardStatusChangedRepository = this.dataSource.getRepository(
      GuardStatusChangedEntity,
    );
  }

  static init = (dataSource: DataSource): EventStatusActor => {
    EventStatusActor.instance = new EventStatusActor(dataSource);
    return EventStatusActor.instance;
  };

  static getInstance = (): EventStatusActor => {
    if (!EventStatusActor.instance)
      throw Error(`Database is not instantiated yet`);
    return EventStatusActor.instance;
  };

  insertStatus = async (
    insertedAt: number,
    eventId: string,
    status: AggregateEventStatus,
    txId?: string,
    txType?: TxType,
    txStatus?: AggregateTxStatus,
  ): Promise<void> => {
    const lastValue = await this.getLastStatus(eventId);

    if (
      lastValue &&
      status === lastValue.status &&
      txId === lastValue.txId &&
      txStatus === lastValue.txStatus
    ) {
      return;
    }

    await this.statusChangedRepository.insert({
      insertedAt,
      eventId,
      status,
      txId,
      txType,
      txStatus,
    });
  };

  getLastStatus = async (
    eventId: string,
  ): Promise<StatusChangedEntity | null> => {
    return await this.statusChangedRepository
      .createQueryBuilder('record')
      .where('record.eventId = :eventId', {
        eventId,
      })
      .orderBy('record.insertedAt', 'DESC')
      .getOne();
  };

  getStatusTimeline = async (
    eventId: string,
  ): Promise<StatusChangedEntity[]> => {
    return await this.statusChangedRepository
      .createQueryBuilder('record')
      .where('record.eventId = :eventId', {
        eventId,
      })
      .orderBy('record.insertedAt', 'DESC')
      .getMany();
  };

  getStatusesById = async (
    eventIds: string[],
  ): Promise<StatusChangedEntity[]> => {
    return await this.statusChangedRepository
      .createQueryBuilder('record')
      .select()
      .where('record.eventId IN (:...eventIds)', {
        eventIds,
      })
      .orderBy('record.eventId', 'ASC')
      .distinctOn(['record.eventId'])
      .addOrderBy('record.insertedAt', 'DESC')
      .getMany();
  };

  insertGuardStatus = async (
    insertedAt: number,
    guardPk: string,
    eventId: string,
    status: EventStatus,
    txId?: string,
    txType?: TxType,
    txStatus?: TxStatus,
  ): Promise<void> => {
    const lastValue = await this.getLastGuardStatus(eventId, guardPk);

    if (
      lastValue &&
      status === lastValue.status &&
      txId === lastValue.txId &&
      txStatus === lastValue.txStatus
    ) {
      return;
    }

    await this.guardStatusChangedRepository.insert({
      insertedAt,
      guardPk,
      eventId,
      status,
      txId,
      txType,
      txStatus,
    });
  };

  getLastGuardStatus = async (
    eventId: string,
    guardPk: string,
  ): Promise<GuardStatusChangedEntity | null> => {
    return await this.guardStatusChangedRepository
      .createQueryBuilder('record')
      .where('record.eventId = :eventId AND record.guardPk = :guardPk', {
        eventId,
        guardPk,
      })
      .orderBy('record.insertedAt', 'DESC')
      .getOne();
  };

  getGuardStatusTimeline = async (
    eventId: string,
    guardPks: string[],
  ): Promise<GuardStatusChangedEntity[]> => {
    return await this.guardStatusChangedRepository
      .createQueryBuilder('record')
      .where('record.eventId = :eventId AND record.guardPk IN (:...guardPks)', {
        eventId,
        guardPks,
      })
      .orderBy('record.insertedAt', 'DESC')
      .getMany();
  };

  getGuardsLastStatus = async (
    eventId: string,
  ): Promise<GuardStatusChangedEntity[]> => {
    return await this.guardStatusChangedRepository
      .createQueryBuilder('record')
      .where('record.eventId = :eventId', {
        eventId,
      })
      .orderBy('record.guardPk', 'DESC')
      .distinctOn(['record.guardPk'])
      .addOrderBy('record.insertedAt', 'DESC')
      .getMany();
  };
}
