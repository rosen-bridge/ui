import { ReactNode } from 'react';

import { AngleRight, Exchange } from '@rosen-bridge/icons';
import {
  Card,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  useBreakpoint,
  useStickyBox,
  EnhancedDialog,
  CardContent,
  Box,
  Divider,
  Label,
  Amount2,
  Network,
  Typography,
  CardHeader,
  SvgIcon,
  Chip,
  Identifier,
  Token,
  RelativeTime,
  Button,
} from '@rosen-bridge/ui-kit';
import { getDecimalString } from '@rosen-ui/utils';

import { EventItem } from '@/_types';

// TODO: move this component to the ui-kit
const Columns = ({
  children,
  gap,
  rule,
  width,
}: {
  children?: ReactNode;
  gap?: string;
  rule?: boolean;
  width: string;
}) => {
  return (
    <Box
      sx={{
        'columnWidth': width,
        'columnGap': gap,
        'columnRule': rule ? '1px solid red' : '',
        '& > *': {
          breakInside: 'avoid',
        },
      }}
    >
      {children}
    </Box>
  );
};

const Content = ({ value }: EventListSidebarProps) => {
  if (!value) return <EmptyState />;

  return (
    <Columns width="20rem" rule>
      <Label orientation={'horizontal'} label="Event Id">
        <Identifier copyable value={value.eventId} />
      </Label>
      <Label label="Status">
        <Chip
          label={value.status && 'completed'}
          color={'success'}
          icon={'CheckCircle'}
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
        <Label label="Source Tx" inset>
          <Identifier copyable value={value.sourceTxId} />
        </Label>
        <Label label="Payment Tx" inset>
          <Identifier copyable value={value.paymentTxId || ''} />
        </Label>
        <Label label="Reward Tx" inset>
          <Identifier copyable value={value.spendTxId || ''} />
        </Label>
      </div>
      <div>
        <Label label="Address"></Label>
        <Label label="From" inset>
          <Identifier copyable value={value.fromAddress} />
        </Label>
        <Label label="To" inset>
          <Identifier copyable value={value.toAddress} />
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

const EmptyState = () => (
  <div
    style={{
      width: '100%',
      height: 'clamp(320px, 100vh, calc(100vh - 295px))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}
  >
    <Typography
      variant="body1"
      sx={{ color: (theme) => theme.palette.text.secondary }}
    >
      Select an event to see
      <br />
      its details.
    </Typography>
  </div>
);

const Header = ({ value }: EventListSidebarProps) => {
  return (
    <div>
      <CardHeader
        sx={{
          paddingBottom: (theme) => theme.spacing(1),
        }}
        title={<Typography variant="h5">Event</Typography>}
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
      <Divider variant="middle" style={{ borderStyle: 'dashed' }} />
    </div>
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
      sx={{
        width: '330px',
        marginLeft: (theme) => theme.spacing(2),
      }}
    >
      <Header value={value} />
      <CardContent
        sx={{
          paddingTop: (theme) => theme.spacing(1),
        }}
      >
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
