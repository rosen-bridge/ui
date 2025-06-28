import { Exchange } from '@rosen-bridge/icons';
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
} from '@rosen-bridge/ui-kit';
import { getDecimalString } from '@rosen-ui/utils';
import moment from 'moment';

import { EventItem } from '@/_types';

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
        <Label label="Event Id">TODO {value.eventId}</Label>
        <Label label="Status">
          TODO{' '}
          {{
            fraud: 'fraud',
            processing: 'processing',
            successful: 'done',
          }[value.status] ?? 'unknown'}
        </Label>
        <Label label="Token">TODO {value.lockToken.name}</Label>
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
          TODO {value.sourceTxId}
        </Label>
        <Label label="Payment Tx" inset>
          TODO
        </Label>
        <Label label="Reward Tx" inset>
          TODO
        </Label>
      </div>
      <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />
      <div>
        <Label label="Address"></Label>
        <Label label="From" inset>
          TODO {value.fromAddress}
        </Label>
        <Label label="To" inset>
          TODO {value.toAddress}
        </Label>
        <Label label="Duration">
          TODO {moment(value.timestamp * 1000).fromNow()}
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
        <Label label="Reports">TODO</Label>
        <Label label="Height">TODO {value.height}</Label>
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
  console.log('Details', props);
  const drawer = useBreakpoint('laptop-down');
  if (drawer) {
    return <DetailsDrawer {...props} />;
  } else {
    return <DetailsSidebar {...props} />;
  }
};
