import { AngleRight, ArrowRight, Exchange } from '@rosen-bridge/icons';
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
} from '@rosen-bridge/ui-kit';
import { getDecimalString } from '@rosen-ui/utils';
import { upperCase } from 'lodash-es';
import moment from 'moment';

import { EventItem } from '@/_types';
import Chip2 from '@/events-experimental/components/Chip2';
import { Identifier } from '@/events-experimental/components/Identifier';
import { Token } from '@/events-experimental/components/Token';

const renderEmptyState = () => (
  <Box
    sx={{
      width: '100%',
      height: '95vh',
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

const DetailsContent = ({ value }: Pick<DetailsProps, 'value'>) => {
  console.log(value);
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
        <Label label="Event Id">
          <Identifier value={value.eventId} />
        </Label>
        <Label label="Status">
          <Chip2
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
          <Identifier value={value.sourceTxId} />
        </Label>
        <Label label="Payment Tx" inset>
          {/*TODO: Value for Payment Tx is not available yet. */}
          <Identifier value={value.sourceTxId} />
        </Label>
        <Label label="Reward Tx" inset>
          {/*TODO: Value for Reward Tx is not available yet. */}
          <Identifier value={value.sourceTxId} />
        </Label>
      </div>
      <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />
      <div>
        <Label label="Address"></Label>
        <Label label="From" inset>
          <Identifier value={value.fromAddress} />
        </Label>
        <Label label="To" inset>
          <Identifier value={value.toAddress} />
        </Label>
        <Label label="Duration">
          {/*TODO: check this for using in moment */}
          {moment(value.timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')}
          {/*<Amount2 value={} />*/}
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
        <Label label="Reports">Not Found</Label>
        <Label label="Height">{value.height}</Label>
      </div>
    </Box>
  );
};

const DetailsDrawer = ({ value, onClose }: DetailsProps) => {
  return (
    <EnhancedDialog open={!!value} stickOn="laptop" onClose={onClose}>
      <EnhancedDialogTitle icon={<Exchange />} onClose={onClose}>
        Event Details
      </EnhancedDialogTitle>
      <EnhancedDialogContent>
        <DetailsContent value={value} />
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

const DetailsHeader = () => {
  const ActionWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    color: theme.palette.primary.main,
    cursor: 'pointer',
  }));
  const BorderBottom = styled('div')(({ theme }) => ({
    width: '100%',
    borderBottom: `1px dashed ${theme.palette.divider}`,
  }));

  return (
    <div>
      <CardHeader
        title={<Typography variant="h5">Event</Typography>}
        action={
          <ActionWrapper>
            <Typography variant="caption">
              {upperCase('see details')}
            </Typography>
            <SvgIcon>
              <AngleRight />
            </SvgIcon>
          </ActionWrapper>
        }
      />
      <Box sx={{ padding: (theme) => theme.spacing(0, 2) }}>
        <BorderBottom />
      </Box>
    </div>
  );
};

const DetailsSidebar = ({ value }: DetailsProps) => {
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
      <DetailsHeader />
      <CardContent>
        <DetailsContent value={value} />
      </CardContent>
    </Card>
  );
};

export type DetailsProps = {
  value?: EventItem;
  onClose: () => void;
};

export const Details = (props: DetailsProps) => {
  const drawer = useBreakpoint('laptop-down');
  if (drawer) {
    return <DetailsDrawer {...props} />;
  } else {
    return <DetailsSidebar {...props} />;
  }
};
