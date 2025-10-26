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
import { getAddressUrl, getDecimalString, getTxURL } from '@rosen-ui/utils';

import { EventItem } from '@/types';

const Content = ({ value }: EventSidebarProps) => {
  const isTablet = useBreakpoint('laptop-down');

  const eventData = useMemo(() => {
    if (!value) return null;

    const data: EventDetailsProps['value'] = {
      amount: getDecimalString(
        value.amount,
        value.lockToken.significantDecimals,
      ),
      bridgeFee: getDecimalString(
        value.bridgeFee,
        value.lockToken.significantDecimals,
      ),
      fromAddress: value.fromAddress,
      fromAddressUrl: getAddressUrl(value.fromChain, value.fromAddress),
      fromChain: value.fromChain,
      height: value.height,
      href: `/events/${value.eventId}`,
      id: value.eventId,
      networkFee: getDecimalString(
        value.networkFee,
        value.lockToken.significantDecimals,
      ),
      reports: value.WIDsCount,
      sourceTxId: value.sourceTxId,
      sourceTxIdUrl: getTxURL(value.fromChain, value.sourceTxId),
      status: value.status,
      toAddress: value.toAddress,
      toAddressUrl: getAddressUrl(value.toChain, value.toAddress),
      toChain: value.toChain,
      token: value.lockToken.name,
      paymentTxId: value.paymentTxId ?? undefined,
      paymentTxIdUrl: value.paymentTxId
        ? getTxURL(value.toChain, value.paymentTxId)
        : undefined,
      spendTxId: value.spendTxId ?? undefined,
      spendTxIdUrl: value.spendTxId
        ? getTxURL(NETWORKS.ergo.key, value.spendTxId)
        : undefined,
      timestamp: value.timestamp,
    };

    if (value.status === 'fraud') {
      delete data.paymentTxId;
      delete data.spendTxId;
    }

    return data;
  }, [value]);

  if (!eventData) {
    return (
      <Center style={{ minHeight: 'calc(100vh - 304px)' }}>
        <Typography variant="body1" color="text.secondary">
          Select an event to see its details.
        </Typography>
      </Center>
    );
  }

  return <EventDetails value={eventData} showSeeDetailsButton={isTablet} />;
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
