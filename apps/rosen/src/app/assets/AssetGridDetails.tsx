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

import { Assets as AssetType } from '@/types/api';

import { useAsset } from './useAsset';

interface AssetGridDetailsProps {
  item: AssetType | undefined;
  onClose?: () => void;
}

const DetailsContent = ({ item }: { item: AssetType }) => {
  const { tokenUrl, hot, hotUrl, cold, coldUrl, locked, bridged } =
    useAsset(item);

  return (
    <Columns width="175px" count={2} rule gap="32px">
      <Label label="Locked" orientation="horizontal">
        <Token name={item.name} href={tokenUrl} reverse />
      </Label>
      <Label label="Locked" orientation="horizontal">
        <Amount value={locked} />
      </Label>
      <Label label="Hot" orientation="horizontal" inset>
        <Amount value={hot} href={hotUrl} />
      </Label>
      <Label label="Cold" orientation="horizontal" inset>
        <Amount value={cold} href={coldUrl} />
      </Label>
      <Label label="Bridged" orientation="horizontal">
        <Amount value={bridged} />
      </Label>
    </Columns>
  );
};

const DetailsDrawer = ({ item, onClose }: AssetGridDetailsProps) => {
  return (
    <EnhancedDialog open={!!item} stickOn="laptop" onClose={onClose}>
      <EnhancedDialogTitle icon={<BitcoinCircle />} onClose={onClose}>
        Asset Details
      </EnhancedDialogTitle>
      <EnhancedDialogContent>
        {item && <DetailsContent item={item} />}
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

const DetailsSidebar = ({ item }: AssetGridDetailsProps) => {
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
        {item ? (
          <DetailsContent item={item} />
        ) : (
          <Center style={{ minHeight: 'calc(100vh - 304px)' }}>
            <Typography variant="body1" color="text.secondary">
              Select an asset to see its details.
            </Typography>
          </Center>
        )}
      </CardBody>
    </Card>
  );
};

export const AssetGridDetails = (props: AssetGridDetailsProps) => {
  const drawer = useBreakpoint('laptop-down');
  if (drawer) {
    return <DetailsDrawer {...props} />;
  } else {
    return <DetailsSidebar {...props} />;
  }
};
