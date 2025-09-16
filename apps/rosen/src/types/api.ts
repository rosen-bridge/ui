import { getAsset, getAllAssets } from '@/backend/assets';
import {
  getEventByIdService,
  getEventsWithFullTokenData,
} from '@/backend/events';

export type ApiEventResponse = Awaited<
  ReturnType<typeof getEventsWithFullTokenData>
>;
export type EventItem = ApiEventResponse['items'][0];
type ArrayElement<T> = T extends (infer Element)[] ? Element : never;
export type Event = ArrayElement<ApiEventResponse['items']>;

export type ApiAssetsResponse = Awaited<ReturnType<typeof getAllAssets>>;
export type Assets = ArrayElement<ApiAssetsResponse['items']>;

export type ApiAssetResponse = Awaited<ReturnType<typeof getAsset>>;

export type ApiEventByIdResponse = Awaited<
  ReturnType<typeof getEventByIdService>
>;
export type EventById = ApiEventByIdResponse;
