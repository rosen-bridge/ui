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
} from '@rosen-bridge/ui-kit';

import { EventItem } from '@/_types';

const DetailsContent = ({ value }: Pick<DetailsProps, 'value'>) => {
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
      <div>{value?.id}</div>
      <Divider orientation="vertical" flexItem />
      <div>{value?.status}</div>
    </Box>
  );
};

const DetailsDrawer = ({ value, onClose }: DetailsProps) => {
  return (
    <EnhancedDialog open={!!value} stickOn="laptop" onClose={onClose}>
      <EnhancedDialogTitle icon={<Exchange />}>
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
        height: '120vh',
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
  const drawer = useBreakpoint('laptop-down');
  if (drawer) {
    return <DetailsDrawer {...props} />;
  } else {
    return <DetailsSidebar {...props} />;
  }
};
