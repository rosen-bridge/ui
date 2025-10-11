import {
  GridContainer,
  TableGrid,
  TableGridBody,
  TableGridHead,
  TableGridHeadCol,
} from '@rosen-bridge/ui-kit';

import AssetGridCard from '@/app/assets/AssetGridCard';
import AssetRow from '@/app/assets/AssetRow';
import { Assets } from '@/types/api';

/**
 * ViewSProps
 */
export type ViewSProps = {
  current?: Assets;
  items?: Assets[];
  isLoading?: boolean;
  setCurrent?: (current: Assets) => void;
};

export const RowView = ({ items, isLoading }: ViewSProps) => {
  return (
    <TableGrid>
      <TableGridHead>
        <TableGridHeadCol>Name</TableGridHeadCol>
        <TableGridHeadCol>Network</TableGridHeadCol>
        <TableGridHeadCol hideOn="tablet-down">Locked</TableGridHeadCol>
        <TableGridHeadCol hideOn="desktop-down">Hot</TableGridHeadCol>
        <TableGridHeadCol hideOn="desktop-down">Cold</TableGridHeadCol>
        <TableGridHeadCol hideOn="laptop-down">Bridged</TableGridHeadCol>
        <TableGridHeadCol style={{ padding: 0 }} width="2.5rem" />
      </TableGridHead>
      <TableGridBody>
        {items?.map((item, index) => (
          <AssetRow key={index} item={item} isLoading={isLoading} />
        ))}
      </TableGridBody>
    </TableGrid>
  );
};

export const GridView = ({
  items,
  isLoading,
  current,
  setCurrent,
}: ViewSProps) => (
  <GridContainer minWidth="260px" gap="8px">
    {items?.map((item) => (
      <AssetGridCard
        key={item.id}
        item={item}
        isLoading={isLoading}
        isActive={item.id === current?.id}
        onClick={setCurrent}
      />
    ))}
  </GridContainer>
);
