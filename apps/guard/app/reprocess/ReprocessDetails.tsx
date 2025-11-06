import { Download } from '@rosen-bridge/icons';
import { Upload } from '@rosen-bridge/icons';
import {
  Amount,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Center,
  Columns,
  DateTime,
  Divider,
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  EventStatus,
  Identifier,
  Label,
  LabelGroup,
  Network,
  Token,
  Typography,
  useBreakpoint,
  useStickyBox,
} from '@rosen-bridge/ui-kit';

import { ReprocessRequest, REQUEST_TYPE } from './page';
import { ReprocessStatus } from './ReprocessStatus';

interface DetailsProps {
  value?: ReprocessRequest;
  onClose?: () => void;
}

const getTitle = (type: ReprocessRequest['type'] | undefined) => {
  if (!type) return 'Request Details';
  return `${REQUEST_TYPE[type]} Request`;
};

const Content = ({ value }: DetailsProps) => {
  if (!value) {
    return (
      <Center style={{ minHeight: 'calc(100vh - 304px)' }}>
        <Typography variant="body1" color="text.secondary">
          Select a request to see its details.
        </Typography>
      </Center>
    );
  }

  return (
    <Columns width="250px" count={2} rule gap="32px">
      <Label label="Request Id" orientation="horizontal">
        <Identifier value={value.id} copyable />
      </Label>
      <Label label="Time" orientation="horizontal">
        <DateTime timestamp={value.timestamp} />
      </Label>
      {value.type == 'INCOMING' ? (
        <>
          <Label label="Status" orientation="horizontal">
            <ReprocessStatus status={value.status} />
          </Label>
          <Label label="Sender" orientation="horizontal">
            <Typography>{value.sender}</Typography>
          </Label>
        </>
      ) : (
        <>
          <Label label="Number of Submissions" orientation="horizontal">
            <Typography>{value.submissions}</Typography>
          </Label>
          <Label label="Number of Acceptances" orientation="horizontal">
            <Typography>{value.acceptances}</Typography>
          </Label>
        </>
      )}
      <Divider borderStyle="dashed" style={{ margin: '8px 0' }} />
      <Label orientation="horizontal" label="Event Id">
        <Identifier copyable value={value.eventId} />
      </Label>
      <Label label="Status">
        <EventStatus value={value.event.status} />
      </Label>
      <Label label="Token">
        <Token reverse name={value.event.token} />
      </Label>
      <Label label="Amount">
        <Amount value={value.event.amount} />
      </Label>
      <div>
        <Label label="Chain" />
        <LabelGroup>
          <Label label="From" inset>
            <Network name={value.event.fromChain} reverse />
          </Label>
          <Label label="To" inset>
            <Network name={value.event.toChain} reverse />
          </Label>
        </LabelGroup>
      </div>
    </Columns>
  );
};

const Drawer = ({ value, onClose }: DetailsProps) => {
  return (
    <EnhancedDialog open={!!value} stickOn="laptop" onClose={onClose}>
      <EnhancedDialogTitle
        icon={value?.type == 'INCOMING' ? <Download /> : <Upload />}
        onClose={onClose}
      >
        {getTitle(value?.type)}
      </EnhancedDialogTitle>
      <EnhancedDialogContent>
        <Content value={value} />
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

const Sidebar = ({ value }: DetailsProps) => {
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
      <CardHeader>
        <CardTitle>{getTitle(value?.type)}</CardTitle>
      </CardHeader>
      <CardBody>
        <Content value={value} />
      </CardBody>
    </Card>
  );
};

export const ReprocessDetails = (props: DetailsProps) => {
  const drawer = useBreakpoint('laptop-down');
  if (drawer) {
    return <Drawer {...props} />;
  } else {
    return <Sidebar {...props} />;
  }
};
