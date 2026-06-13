import { useMemo } from 'react';

import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardHeader,
  CardTitle,
  Center,
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  EventDetails,
  EventDetailsProps,
  Icon,
  Typography,
  useBreakpoint,
  useStickyBox,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getAddressUrl, getTxURL } from '@rosen-ui/utils';
import useSWR from 'swr';

import { ApiEventResponse, EventItem } from '@/types';

const Content = ({ value }: SidebarProps) => {
  const shouldLoad = useMemo(() => {
    return !!value && !!value.eventId && value.status !== 'multipleFlows';
  }, [value]);

  const { data, isLoading } = useSWR<EventItem>(
    shouldLoad && `/v1/events/${value?.eventId}`,
    fetcher,
  );

  const eventData = useMemo(() => {
    const result: EventDetailsProps['value'] = {
      amount: data?.amount,
      bridgeFee: data?.bridgeFee,
      decimal: data?.lockToken?.significantDecimal,
      fromAddress: data?.fromAddress,
      fromAddressUrl: getAddressUrl(data?.fromChain, data?.fromAddress),
      fromChain: data?.fromChain,
      height: data?.height,
      id: data?.eventId,
      networkFee: data?.networkFee,
      price: data?.price,
      reports: data?.WIDsCount,
      sourceTxId: data?.sourceTxId,
      sourceTxIdUrl: getTxURL(data?.fromChain, data?.sourceTxId),
      status: data?.status,
      toAddress: data?.toAddress,
      toAddressUrl: getAddressUrl(data?.toChain, data?.toAddress),
      toChain: data?.toChain,
      timestamp: data?.timestamp,
      token: data?.lockToken?.id,
    };

    if (result.status !== 'fraud') {
      result.paymentTxId = data?.paymentTxId ?? undefined;
      result.paymentTxIdUrl = getTxURL(data?.toChain, result?.paymentTxId);
      result.spendTxId = data?.spendTxId ?? undefined;
      result.spendTxIdUrl = getTxURL(NETWORKS.ergo.key, result?.spendTxId);
    }

    return result;
  }, [data]);

  if (!value || value.status === 'multipleFlows') {
    return (
      <Center style={{ minHeight: 'calc(100vh - 304px)' }}>
        <Typography variant="body1" color="text-secondary">
          {value ? (
            <>
              This event has multiple flows. Click <b>See Details</b> for more
              information.
            </>
          ) : (
            <>Select an event to see its details.</>
          )}
        </Typography>
      </Center>
    );
  }

  return <EventDetails loading={isLoading} value={eventData} />;
};

const Drawer = ({ value, onClose }: SidebarProps) => {
  return (
    <EnhancedDialog open={!!value} stickOn="laptop" onClose={onClose}>
      <EnhancedDialogTitle icon="Exchange" onClose={onClose}>
        Event Details
      </EnhancedDialogTitle>
      <EnhancedDialogContent>
        <Content value={value} />
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

const Panel = ({ value }: SidebarProps) => {
  const stickyRef = useStickyBox({
    offsetTop: 16,
    offsetBottom: 16,
  });
  return (
    <Card
      ref={stickyRef}
      variant="separated"
      style={{
        width: '330px',
        marginLeft: '16px',
      }}
    >
      <CardHeader>
        <CardTitle>Event</CardTitle>
        {value && (
          <CardAction
            style={{
              height: 0,
              display: 'flex',
              alignItems: 'center',
              marginRight: '-1rem',
            }}
          >
            <Button
              variant="text"
              size="small"
              target="_blank"
              href={`/events/${value.eventId}`}
              endIcon={<Icon name="AngleRight" />}
            >
              SEE DETAILS
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardBody>
        <Content value={value} />
      </CardBody>
    </Card>
  );
};

export type SidebarProps = {
  value?: ApiEventResponse['items'][number];
  onClose?: () => void;
};

export const Sidebar = (props: SidebarProps) => {
  const drawer = useBreakpoint('laptop-down');
  if (drawer) {
    return <Drawer {...props} />;
  } else {
    return <Panel {...props} />;
  }
};
