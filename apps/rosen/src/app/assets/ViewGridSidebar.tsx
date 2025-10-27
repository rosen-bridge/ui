import { BitcoinCircle } from '@rosen-bridge/icons';
import {
  Amount,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Center,
  Columns,
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  Label,
  Token,
  Typography,
  useBreakpoint,
  useStickyBox,
} from '@rosen-bridge/ui-kit';

import { BridgedList } from './BridgedList';
import { AssetsFullData } from './getFullAssetData';

const Content = ({ value }: ViewGridSidebarProps) => {
  if (!value) {
    return (
      <Center style={{ minHeight: 'calc(100vh - 304px)' }}>
        <Typography variant="body1" color="text.secondary">
          Select an event to see its details.
        </Typography>
      </Center>
    );
  }

  return (
    <Columns width="250px" count={2} rule gap="32px">
      <Label label="Token" orientation="horizontal">
        <Token name={value.name} href={value.tokenUrl} reverse />
      </Label>
      <Label label="Locked" orientation="horizontal">
        <Amount value={value.lockedAmount} />
      </Label>
      <Label label="Hot" orientation="horizontal" inset>
        <Amount value={value.hotAmount} href={value.hotUrl} />
      </Label>
      <Label label="Cold" orientation="horizontal" inset>
        <Amount value={value.coldAmount} href={value.coldUrl} />
      </Label>
      <Label label="Bridged" orientation="horizontal">
        <Amount value={value.bridgedAmount} />
      </Label>
      <div>
        <Label label="Bridged to" />
        <BridgedList value={value} />
      </div>
    </Columns>
  );
};

const DetailsDrawer = ({ value, onClose }: ViewGridSidebarProps) => {
  return (
    <EnhancedDialog open={!!value} stickOn="laptop" onClose={onClose}>
      <EnhancedDialogTitle icon={<BitcoinCircle />} onClose={onClose}>
        Asset Details
      </EnhancedDialogTitle>
      <EnhancedDialogContent>
        <Content value={value} />
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

const DetailsSidebar = ({ value }: ViewGridSidebarProps) => {
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
        <CardTitle>Asset</CardTitle>
      </CardHeader>
      <CardBody>
        <Content value={value} />
      </CardBody>
    </Card>
  );
};

export interface ViewGridSidebarProps {
  value?: AssetsFullData;
  onClose?: () => void;
}

export const ViewGridSidebar = (props: ViewGridSidebarProps) => {
  const drawer = useBreakpoint('laptop-down');
  if (drawer) {
    return <DetailsDrawer {...props} />;
  } else {
    return <DetailsSidebar {...props} />;
  }
};
