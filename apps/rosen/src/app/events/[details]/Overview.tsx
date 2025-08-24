'use client';

import React, { useEffect } from 'react';

import {
  Amount2,
  Columns,
  Connector,
  Identifier,
  Label,
  Network,
  RelativeTime,
  Stack,
  Token,
  useBreakpoint,
  Skeleton,
  Chip,
  Typography,
  Grid,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { DetailsCard } from '@/app/events/[details]';
import { BridgeEvent } from '@/app/events/[details]/type';

type EventStatusProps = {
  value: 'fraud' | 'processing' | 'successful' | undefined;
};

const SkeletonOverview = () => {
  return (
    <div>
      <Stack flexDirection="column" gap={2}>
        <Skeleton width="100%" height="30px" />
        <Columns width={'320px'} gap={'16px'} count={3}>
          {Array.from(Array(6).keys()).map((_, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <Skeleton variant="rounded" height={100} width={'100%'} />
            </div>
          ))}
        </Columns>
      </Stack>
    </div>
  );
};

const EventStatus = ({ value }: EventStatusProps) => {
  switch (value) {
    case 'fraud':
      return null;
    case 'processing':
      return <Chip label={value} color="info" icon="Hourglass" />;
    case 'successful':
      return <Chip label={value} color="success" icon="CheckCircle" />;
    default:
      return null;
  }
};

export const Overview = ({ id }: { id: string }) => {
  const isMobile = useBreakpoint('tablet-down');

  const { data } = useSWR<BridgeEvent>(`/v1/events/${id}`, fetcher);
  const isLoading = true;
  const orientation = isMobile ? 'horizontal' : 'vertical';

  function time(timestamp: number) {
    const date = new Date(timestamp);

    const formatted = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);

    return formatted.replace(',', '');
  }

  useEffect(() => {
    console.log(data);
  }, [data, isLoading]);

  return (
    <DetailsCard state="open" title="Overview">
      <div style={{ width: '70%' }}>
        {!isLoading && data ? (
          <Label orientation="vertical" label="Event Id">
            <Identifier
              value={data.eventTriggers?.eventId || 'error loading !!!'}
              copyable
            />
          </Label>
        ) : (
          <Stack>
            <Label orientation="horizontal" label="Event Id"></Label>
            <Skeleton
              variant="rectangular"
              style={{ width: '100%', borderRadius: '4px' }}
              height={'14px'}
            />
          </Stack>
        )}
      </div>
      <Columns count={3} width="320px" gap="24px">
        <Label label="Amount" orientation={orientation}>
          {!isLoading && data ? (
            <Amount2 value={data.amount} orientation="horizontal" unit="N/A" />
          ) : (
            <Amount2 loading />
          )}
        </Label>

        <Label label="Token" orientation={orientation}>
          {!isLoading && data ? (
            <Token name={data.sourceChainTokenId} reverse={isMobile} />
          ) : (
            <Stack alignItems="center" flexDirection="row" gap={1}>
              <Skeleton width={32} height={32} variant="circular" />
              <Skeleton width={80} height={14} variant="rounded" />
            </Stack>
          )}
        </Label>

        <Label label="Time" orientation={orientation}>
          {!isLoading && data ? (
            <Typography color="text.primary" variant="body1">
              {time(data.timestamp || 175522841)}
            </Typography>
          ) : (
            <Skeleton width={80} height={14} variant="rounded" />
          )}
        </Label>
        <Label label="Fee Sum" orientation={orientation}>
          {!isLoading && data ? (
            <Amount2
              value={data.networkFee}
              orientation="horizontal"
              unit={data.sourceChainTokenId}
            />
          ) : (
            <Skeleton width={80} height={14} variant="rounded" />
          )}
        </Label>

        <Label label="Status" orientation={orientation}>
          {!isLoading && data ? (
            <>
              {data.status === undefined ? (
                <EventStatus value={'successful'} />
              ) : (
                <EventStatus value={data.status} />
              )}
            </>
          ) : (
            <Skeleton width={80} height={14} variant="rounded" />
          )}
        </Label>

        <Label orientation={orientation} label="Chin">
          <Stack alignItems="center">
            {!isLoading && data ? (
              <Connector
                start={
                  <Network
                    variant={isMobile ? 'logo' : 'both'}
                    name={data.fromChain}
                  />
                }
                end={
                  <Network
                    variant={isMobile ? 'logo' : 'both'}
                    name={data.toChain}
                  />
                }
              />
            ) : (
              <Connector
                start={
                  <Network
                    loading
                    variant={isMobile ? 'logo' : 'both'}
                    name={'ergo'}
                  />
                }
                end={
                  <Network
                    loading
                    variant={isMobile ? 'logo' : 'both'}
                    name={'ergo'}
                  />
                }
              />
            )}
          </Stack>
        </Label>
      </Columns>

      <Stack>
        <Label label="Address"></Label>
        <Stack
          flexDirection={'row'}
          justifyContent="space-between"
          style={{ width: isMobile ? '100%' : '70%' }}
        >
          <Label label="from" inset></Label>
          <div
            style={{
              maxWidth: '568px',
              overflow: 'hidden',
              marginLeft: isMobile ? '10px' : '60px',
            }}
          >
            {!isLoading && data ? (
              <Identifier
                value={data.fromAddress || 'error loading !!!'}
                href={data.fromAddress}
                copyable
              />
            ) : (
              <Identifier value={''} loading />
            )}
          </div>
        </Stack>
        <Stack
          flexDirection={'row'}
          justifyContent="space-between"
          style={{ width: isMobile ? '100%' : '70%' }}
        >
          <Label label="to" inset></Label>
          <div
            style={{
              maxWidth: '568px',
              overflow: 'hidden',
              marginLeft: isMobile ? '10px' : '60px',
            }}
          >
            {!isLoading && data ? (
              <Identifier
                value={data.toAddress || 'error loading !!!'}
                href={data.fromAddress}
                copyable
              />
            ) : (
              <div style={{ width: '100%' }}>
                <Identifier value={''} loading />
              </div>
            )}
          </div>
        </Stack>
      </Stack>
    </DetailsCard>
  );
};

// <Grid container width="100%" >
//   {/* Item 1 */}
//   <Grid item mobile={12} tablet={6} laptop={4} sx={{ pl: 0, pt: 0 }}>
//     <Label label="Amount" orientation={orientation}>
//       <Amount2 value={data.amount} orientation="horizontal" unit="N/A" />
//     </Label>
//     <Label label="Token" orientation={orientation}>
//       <Token name={data.sourceChainTokenId} reverse={isMobile} />
//     </Label>
//   </Grid>
//
//   {/* Item 2 */}
//   <Grid item mobile={12} tablet={6} laptop={4} sx={{ pl: 0, pt: 0 }}>
//     <Label label="Time" orientation={orientation}>
//       <Typography color="text.primary" variant="body1">
//         {time(data.timestamp || 175522841)}
//       </Typography>
//     </Label>
//     <Label label="Fee Sum" orientation={orientation}>
//       <Amount2
//         value={data.networkFee}
//         orientation="horizontal"
//         unit={data.sourceChainTokenId}
//       />
//     </Label>
//   </Grid>
//
//   {/* Item 3 */}
//   <Grid item mobile={12} tablet={12} laptop={4} >
//     <Stack  width='100%' direction={{ mobile: "column", tablet: "row",laptop:'column' }}>
//       <div style={{width: isMobile ? '100%':'50%'}}>
//         <Label label="Status" orientation={orientation}>
//           {data.status === undefined ? (
//             <EventStatus value="successful" />
//           ) : (
//             <EventStatus value={data.status} />
//           )}
//         </Label>
//       </div>
//       <div>
//         <Label orientation={orientation} label="Chain">
//           <Stack alignItems="center">
//             <Connector
//               start={
//                 <Network
//                   variant={isMobile ? 'logo' : 'both'}
//                   name={data.fromChain}
//                 />
//               }
//               end={
//                 <Network
//                   variant={isMobile ? 'logo' : 'both'}
//                   name={data.toChain}
//                 />
//               }
//             />
//           </Stack>
//         </Label>
//       </div>
//     </Stack>
//   </Grid>
// </Grid>
