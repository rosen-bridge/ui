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
  styled,
  Chip,
  Identifier,
  Token,
  RelativeTime,
  Link,
} from '@rosen-bridge/ui-kit';
import { getDecimalString } from '@rosen-ui/utils';
import { upperCase } from 'lodash-es';

import { EventItem } from '@/_types';

const renderEmptyState = () => (
  <Box
    sx={{
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
      <br /> its details.
    </Typography>
  </Box>
);

const SideBarContent = ({ value }: Pick<SideBarProps, 'value'>) => {
  if (!value) return renderEmptyState();

  return (
    <Box
      sx={{
        'containerType': 'inline-size',
        'display': 'flex',
        'flexDirection': 'row',
        'flexWrap': 'wrap',
        'columnGap': (theme) => theme.spacing(2),
        '& > div': {
          flexGrow: 1,
          width: 0,
        },
        '@container (max-width: 600px)': {
          'flexDirection': 'column',
          '& > div': {
            width: '100%',
          },
          '.MuiDivider-root': {
            display: 'none',
          },
        },
      }}
    >
      <div>
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
        <Label label="Chain"></Label>
        <Label label="From" inset>
          <Network name={value.fromChain} reverse />
        </Label>
        <Label label="To" inset>
          <Network name={value.toChain} reverse />
        </Label>
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
      <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />
      <div>
        <Label label="Address"></Label>
        <Label label="From" inset>
          <Identifier copyable value={value.fromAddress} />
        </Label>
        <Label label="To" inset>
          <Identifier copyable value={value.toAddress} />
        </Label>
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
      </div>
    </Box>
  );
};

const DetailsDrawer = ({ value, onClose }: SideBarProps) => {
  return (
    <EnhancedDialog open={!!value} stickOn="laptop" onClose={onClose}>
      <EnhancedDialogTitle icon={<Exchange />} onClose={onClose}>
        Event Details
      </EnhancedDialogTitle>
      <EnhancedDialogContent>
        <SideBarContent value={value} />
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

const SideBarHeader = ({ value }: Pick<SideBarProps, 'value'>) => {
  const ActionWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'end',
    color: theme.palette.primary.main,
    textAlign: 'center',
    cursor: 'pointer',
  }));
  const BorderBottom = styled('div')(({ theme }) => ({
    width: '100%',
    borderBottom: `1px dashed ${theme.palette.divider}`,
  }));

  return (
    <div>
      <CardHeader
        sx={{
          paddingBottom: (theme) => theme.spacing(1),
        }}
        title={<Typography variant="h5">Event</Typography>}
        action={
          value && (
            <ActionWrapper>
              <Typography
                component="a"
                target="_blank"
                href={`/events-experimental/${value.eventId}`}
                sx={{
                  color: (theme) => theme.palette.primary.main,
                  textDecoration: 'none',
                }}
                variant="caption"
              >
                {upperCase('see details')}
              </Typography>
              <SvgIcon>
                <AngleRight />
              </SvgIcon>
            </ActionWrapper>
          )
        }
      />
      <Box sx={{ padding: (theme) => theme.spacing(0, 2) }}>
        <BorderBottom />
      </Box>
    </div>
  );
};

const DetailsSidebar = ({ value }: SideBarProps) => {
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
      <SideBarHeader value={value} />
      <CardContent
        sx={{
          paddingTop: (theme) => theme.spacing(1),
          height: 'auto',
        }}
      >
        <SideBarContent value={value} />
      </CardContent>
    </Card>
  );
};

export type SideBarProps = {
  value?: EventItem;
  onClose: () => void;
};

export const SideBar = (props: SideBarProps) => {
  const drawer = useBreakpoint('laptop-down');
  if (drawer) {
    return <DetailsDrawer {...props} />;
  } else {
    return <DetailsSidebar {...props} />;
  }
};
