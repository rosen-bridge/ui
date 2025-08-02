import { AngleRight, Exchange } from '@rosen-bridge/icons';
import {
  Amount2,
  Button,
  Card,
  CardContent,
  CardHeader,
  Center,
  Columns,
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  Identifier,
  Label,
  Network,
  RelativeTime,
  Stack,
  SvgIcon,
  Token,
  Typography,
  useBreakpoint,
  useStickyBox,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getAddressUrl, getDecimalString } from '@rosen-ui/utils';

import { EventStatus } from '@/app/events/(list)/EventStatus';
import { EventItem } from '@/types';

const Content = ({ value }: EventSidebarProps) => {
  const isTablet = useBreakpoint('laptop-down');
  if (!value)
    return (
      <Center
        style={{
          minHeight: 'calc(100vh - 295px)',
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Select an event to see its details.
        </Typography>
      </Center>
    );

  return (
    <Columns gap="32px" width="20rem" rule>
      <Label orientation="horizontal" label="Event Id">
        <Identifier copyable value={value.eventId} />
      </Label>
      <Label label="Status">
        <EventStatus value={value.status} />
      </Label>
      <Label label="Token">
        <Token reverse name={value.lockToken.name} />
      </Label>
      <Label label="Amount">
        <Amount2
          value={getDecimalString(
            value.amount,
            value.lockToken.significantDecimals,
          )}
        />
      </Label>
      <div>
        <Label label="Chain"></Label>
        <Label label="From" inset>
          <Network name={value.fromChain} reverse />
        </Label>
        <Label label="To" inset>
          <Network name={value.toChain} reverse />
        </Label>
      </div>
      <div>
        <Label label="Tx IDs"></Label>
        <Label label="Lock Tx" inset>
          <Identifier
            copyable={!!value.sourceTxId}
            value={value.sourceTxId}
            href={
              value.sourceTxId
                ? getAddressUrl(value.fromChain, value.sourceTxId)!
                : undefined
            }
          />
        </Label>
        <Label label="Payment Tx" inset>
          <Identifier
            copyable={!!value.paymentTxId}
            value={value.paymentTxId || ''}
            href={
              value.paymentTxId
                ? getAddressUrl(value.toChain, value.paymentTxId)!
                : undefined
            }
          />
        </Label>
        <Label label="Reward Tx" inset>
          <Identifier
            copyable={!!value.spendTxId}
            value={value.spendTxId || ''}
            href={
              value.spendTxId
                ? getAddressUrl(NETWORKS.ergo.key, value.spendTxId)!
                : undefined
            }
          />
        </Label>
      </div>
      <div>
        <Label label="Address"></Label>
        <Label label="From" inset>
          <Identifier
            copyable
            value={value.fromAddress}
            href={
              getAddressUrl(value.fromChain, value.fromAddress) || undefined
            }
          />
        </Label>
        <Label label="To" inset>
          <Identifier
            copyable
            value={value.toAddress}
            href={getAddressUrl(value.toChain, value.toAddress) || undefined}
          />
        </Label>
      </div>
      <Label label="Time">
        <RelativeTime timestamp={value.timestamp} />
      </Label>
      <Label label="Bridge fee">
        <Amount2
          value={getDecimalString(
            value.bridgeFee,
            value.lockToken.significantDecimals,
          )}
        />
      </Label>
      <Label label="Network Fee">
        <Amount2
          value={getDecimalString(
            value.networkFee,
            value.lockToken.significantDecimals,
          )}
        />
      </Label>
      <Label label="Reports">{value.WIDsCount ?? 'N/C'}</Label>
      <Label label="Height">{value.height}</Label>
      {isTablet && (
        <Stack alignItems="end">
          <Button
            variant="text"
            size="medium"
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
        </Stack>
      )}
    </Columns>
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
      style={{
        width: '330px',
        marginLeft: '16px',
      }}
    >
      <CardHeader
        title="Event"
        separator
        regular
        action={
          value && (
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
          )
        }
      />
      <CardContent style={{ paddingTop: 0 }}>
        <Content value={value} />
      </CardContent>
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
