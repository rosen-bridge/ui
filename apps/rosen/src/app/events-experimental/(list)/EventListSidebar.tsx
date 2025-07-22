import { AngleRight, Exchange } from '@rosen-bridge/icons';
import {
  Amount2,
  Button,
  Card,
  CardContent,
  CardHeader,
  Center,
  Chip,
  Columns,
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  Identifier,
  Label,
  Network,
  RelativeTime,
  SvgIcon,
  Token,
  Typography,
  useBreakpoint,
  useStickyBox,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { getAddressUrl, getDecimalString } from '@rosen-ui/utils';

import { EventItem } from '@/types';

const Content = ({ value }: EventListSidebarProps) => {
  if (!value)
    return (
      <Center
        style={{
          height: 'clamp(320px, 100vh, calc(100vh - 310px))',
        }}
      >
        <Typography
          variant="body1"
          sx={{ color: (theme) => theme.palette.text.secondary }}
        >
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
        <Chip
          label={value.status && 'completed'}
          color="success"
          icon="CheckCircle"
        />
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
            copyable
            value={value.sourceTxId}
            href={
              getAddressUrl(value.fromChain, value.sourceTxId || '') ||
              undefined
            }
          />
        </Label>
        <Label label="Payment Tx" inset>
          <Identifier
            copyable
            value={value.paymentTxId || ''}
            href={
              getAddressUrl(value.toChain, value.paymentTxId || '') || undefined
            }
          />
        </Label>
        <Label label="Reward Tx" inset>
          <Identifier
            copyable
            value={value.spendTxId || ''}
            href={
              getAddressUrl(NETWORKS.ergo.key, value.spendTxId || '') ||
              undefined
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
      <Label label="Duration">
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
      <Label label="Reports">{value.WIDsCount}</Label>
      <Label label="Height">{value.height}</Label>
    </Columns>
  );
};

const Drawer = ({ value, onClose }: EventListSidebarProps) => {
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

const DetailsSidebar = ({ value }: EventListSidebarProps) => {
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
        action={
          value && (
            <Button
              variant="text"
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
      <CardContent>
        <Content value={value} />
      </CardContent>
    </Card>
  );
};

export type EventListSidebarProps = {
  value?: EventItem;
  onClose?: () => void;
};

export const EventListSidebar = (props: EventListSidebarProps) => {
  const drawer = useBreakpoint('laptop-down');
  if (drawer) {
    return <Drawer {...props} />;
  } else {
    return <DetailsSidebar {...props} />;
  }
};
