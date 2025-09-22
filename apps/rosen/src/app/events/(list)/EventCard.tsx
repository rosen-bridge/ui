import {
  Amount,
  Avatar,
  Card,
  CardBody,
  Connector,
  Identifier,
  Network,
  RelativeTime,
  Skeleton,
  Stack,
  Typography,
} from '@rosen-bridge/ui-kit';
import { getDecimalString } from '@rosen-ui/utils';
import { capitalize } from 'lodash-es';

import { EventItem } from '@/types';

import { Status } from '../Status';

export type EventCardProps = {
  active?: boolean;
  isLoading?: boolean;
  item?: EventItem;
  onClick?: () => void;
};

export const EventCard = ({
  active,
  isLoading,
  item,
  onClick,
}: EventCardProps) => {
  return (
    <Card
      active={active}
      backgroundColor="background.paper"
      clickable
      onClick={onClick}
    >
      <CardBody>
        <Stack gap={1}>
          <Stack gap={1} flexDirection="row">
            {isLoading && (
              <Skeleton
                variant="circular"
                width={48}
                height={48}
                style={{ minWidth: '48px' }}
              />
            )}
            {!isLoading && item && (
              <Avatar background="secondary.light" color="secondary.main">
                {capitalize(item.lockToken.name.slice(0, 1))}
              </Avatar>
            )}
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              style={{ width: '100%' }}
            >
              <Amount
                loading={isLoading}
                orientation="vertical"
                unit={item?.lockToken?.name}
                value={getDecimalString(
                  item?.amount,
                  item?.lockToken?.significantDecimals,
                )}
              />
              <Stack justifyContent="flex-end">
                <div style={{ marginBottom: '-4px' }}>
                  <RelativeTime
                    isLoading={isLoading}
                    timestamp={item?.timestamp}
                  />
                </div>
              </Stack>
            </Stack>
          </Stack>
          <Identifier
            href={`/events/${item?.eventId}`}
            loading={isLoading}
            value={item?.eventId}
          />
          <Stack flexDirection="row" justifyContent="space-between">
            <Typography component="div" fontSize="12px">
              <Connector
                variant="filled"
                start={
                  <Network
                    loading={isLoading}
                    name={item?.fromChain}
                    variant="logo"
                  />
                }
                end={
                  <Network
                    loading={isLoading}
                    name={item?.toChain}
                    variant="logo"
                  />
                }
              />
            </Typography>
            <Status loading={isLoading} value={item?.status} />
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
};
