import { ObservationEntity } from '@rosen-bridge/observation-extractor';
import { BlockEntity } from '@rosen-bridge/scanner';

import dataSource from '../dataSource';

const observationRepository = dataSource.getRepository(ObservationEntity);
const blockRepository = dataSource.getRepository(BlockEntity);

interface ObservationWithTotal extends Omit<ObservationEntity, 'requestId'> {
  eventId: string;
  total: number;
}

/**
 * remove total field from rawItems returned by query in getEvents
 * @param rawItems
 */
const getItemsWithoutTotal = (rawItems: ObservationWithTotal[]) =>
  rawItems.map(({ total, ...item }) => item);

/**
 * get paginated list of events
 * @param offset
 * @param limit
 */
export const getEvents = async (offset: number, limit: number) => {
  const rawItems: ObservationWithTotal[] = await observationRepository
    .createQueryBuilder('oe')
    .leftJoin(blockRepository.metadata.tableName, 'be', 'be.hash = oe.block')
    .select([
      'oe.id AS id',
      'oe.fromChain AS fromChain',
      'oe.toChain AS toChain',
      'oe.fromAddress AS fromAddress',
      'oe.toAddress AS toAddress',
      'oe.height AS height',
      'oe.amount AS amount',
      'oe.networkFee AS networkFee',
      'oe.bridgeFee AS bridgeFee',
      'oe.sourceChainTokenId AS sourceChainTokenId',
      'oe.sourceTxId AS sourceTxId',
      'oe.requestId AS eventId',
      'be.timestamp AS timestamp',
      'COUNT(*) OVER() AS total',
    ])
    .orderBy('be.timestamp', 'DESC')
    .offset(offset)
    .limit(limit)
    .getRawMany();

  const items = getItemsWithoutTotal(rawItems);

  return {
    items,
    total: rawItems?.[0].total ?? 0,
  };
};
