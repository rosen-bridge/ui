import { getAsset, getAssets } from '@/_backend/assets';
import eventService from '@/_backend/events/event-service';

export type ApiEventResponse = Awaited<
  ReturnType<typeof eventService.getEventsWithFullTokenData>
>;
type ArrayElement<T> = T extends (infer Element)[] ? Element : never;
export type Event = ArrayElement<ApiEventResponse['items']>;

export type ApiAssetsResponse = Awaited<ReturnType<typeof getAssets>>;
export type Assets = ArrayElement<ApiAssetsResponse['items']>;

export type ApiAssetResponse = Awaited<ReturnType<typeof getAsset>>;
