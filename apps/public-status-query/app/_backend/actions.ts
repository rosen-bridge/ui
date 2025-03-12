import {
  PublicStatusActions,
  AggregatedStatusChangedEntity,
  GuardStatusChangedEntity,
  AggregatedStatusEntity,
  Utils,
} from '@rosen-bridge/public-status-logic';

import './initialize-if-needed';

/**
 * a response type used in api
 */
export type AggregatedStatusChangedDTO = Omit<
  AggregatedStatusChangedEntity,
  'id' | 'eventId'
>;

/**
 * helper function to map AggregatedStatusChangedEntity to its DTO
 * @param record
 * @returns AggregatedStatusChangedDTO
 */
export function aggregatedStatusChangedToDTO(
  record: AggregatedStatusChangedEntity,
): AggregatedStatusChangedDTO {
  return Utils.cloneOmitting(record, ['id', 'eventId']);
}

/**
 * a response type used in api
 */
export type AggregatedStatusDTO = Omit<AggregatedStatusEntity, 'eventId'>;

/**
 * helper function to map AggregatedStatusEntity to its DTO
 * @param record
 * @returns AggregatedStatusDTO
 */
export function aggregatedStatusToDTO(
  record: AggregatedStatusEntity,
): AggregatedStatusDTO {
  return Utils.cloneOmitting(record, ['eventId']);
}

/**
 * a response type used in api
 */
export type GuardStatusChangedDTO = Omit<
  GuardStatusChangedEntity,
  'id' | 'eventId'
>;

/**
 * helper function to map GuardStatusChangedEntity to its DTO
 * @param record
 * @returns GuardStatusChangedDTO
 */
export function guardStatusChangedToDTO(
  record: GuardStatusChangedEntity,
): GuardStatusChangedDTO {
  return Utils.cloneOmitting(record, ['id', 'eventId']);
}

export { PublicStatusActions };
