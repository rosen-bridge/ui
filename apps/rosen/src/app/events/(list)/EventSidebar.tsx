import { useMemo } from 'react';

import { AngleRight, Exchange } from '@rosen-bridge/icons';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Center,
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  EventDetails,
  EventDetailsProps,
  SvgIcon,
  Typography,
  useBreakpoint,
  useStickyBox,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getAddressUrl, getTxURL } from '@rosen-ui/utils';
import useSWR from 'swr';

import { EventItem } from '@/types';

const Content = ({ value }: EventSidebarProps) => {
  const isTablet = useBreakpoint('laptop-down');

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
      decimal: data?.lockToken?.significantDecimal,
      price: data?.price,
      bridgeFee: data?.bridgeFee,
      fromAddress: data?.fromAddress,
      fromAddressUrl: getAddressUrl(data?.fromChain, data?.fromAddress),
      fromChain: data?.fromChain,
      height: data?.height,
      href: `/events/${data?.eventId}`,
      id: data?.eventId,
      networkFee: data?.networkFee,
      reports: data?.WIDsCount,
      sourceTxId: data?.sourceTxId,
      sourceTxIdUrl: getTxURL(data?.fromChain, data?.sourceTxId),
      status: data?.status,
      toAddress: data?.toAddress,
      toAddressUrl: getAddressUrl(data?.toChain, data?.toAddress),
      toChain: data?.toChain,
      token: data?.lockToken?.name,
      timestamp: data?.timestamp,
    };

    if (result.status !== 'fraud') {
      result.paymentTxId = data?.paymentTxId ?? undefined;
      result.paymentTxIdUrl = getTxURL(data?.toChain, result?.paymentTxId);
      result.spendTxId = data?.spendTxId ?? undefined;
      result.spendTxIdUrl = getTxURL(NETWORKS.ergo.key, result?.spendTxId);
    }

    return result;
  }, [data]);

  if (!value) {
    return (
      <Center style={{ minHeight: 'calc(100vh - 304px)' }}>
        <Typography variant="body1" color="text.secondary">
          Select an event to see its details.
        </Typography>
      </Center>
    );
  }

  if (value.status === 'multipleFlows') {
    return (
      <Center style={{ minHeight: 'calc(100vh - 304px)' }}>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          This event has multiple flows. Click <b>See Details</b> for more
          information.
        </Typography>
      </Center>
    );
  }

  return (
    <EventDetails
      loading={isLoading}
      value={eventData}
      showSeeDetailsButton={isTablet}
    />
  );
};

const Drawer = ({ value, onClose }: EventSidebarProps) => {
  return (
    <EnhancedDialog open={!!value} stickOn="laptop" onClose={onClose}>
      <EnhancedDialogTitle icon={<Exchange />} onClose={onClose}>
        Event Details
      </EnhancedDialogTitle>
      <EnhancedDialogContent>
        <Content value={value} />
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

const DetailsSidebar = ({ value }: EventSidebarProps) => {
  const stickyRef = useStickyBox({
    offsetTop: 16,
    offsetBottom: 16,
  });
  return (
    <Card
      ref={stickyRef}
      separated
      backgroundColor="background.paper"
      style={{
        width: '330px',
        marginLeft: '16px',
      }}
    >
      <CardHeader
        action={
          value && (
            <div
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
                endIcon={
                  <SvgIcon>
                    <AngleRight />
                  </SvgIcon>
                }
              >
                SEE DETAILS
              </Button>
            </div>
          )
        }
      >
        <CardTitle>Event</CardTitle>
      </CardHeader>
      <CardBody>
        <Content value={value} />
      </CardBody>
    </Card>
  );
};

export type EventSidebarProps = {
  value?: EventItem;
  onClose?: () => void;
};

export const EventSidebar = (props: EventSidebarProps) => {
  const drawer = useBreakpoint('laptop-down');
  if (drawer) {
    return <Drawer {...props} />;
  } else {
    return <DetailsSidebar {...props} />;
  }
};
