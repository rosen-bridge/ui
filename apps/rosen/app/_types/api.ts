import { getAssets } from '@/_backend/assets';
import eventService from '@/_backend/events/event-service';

export type ApiEventResponse = Awaited<
  ReturnType<typeof eventService.getEventsWithFullTokenData>
>;
type ArrayElement<T> = T extends (infer Element)[] ? Element : never;
export type Event = ArrayElement<ApiEventResponse['items']>;

export type ApiAssetResponse = Awaited<ReturnType<typeof getAssets>>;
export type Asset = ArrayElement<ApiAssetResponse['items']>;
