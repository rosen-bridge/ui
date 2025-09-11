import React, { useEffect } from 'react';

import { Breakpoint } from '@mui/material';
import { AngleDown, AngleUp } from '@rosen-bridge/icons';

import { styled } from '../../../styling';
import { SvgIcon, Skeleton, Collapse, IconButton, Divider } from '../../base';
import { InjectOverrides, InjectOverridesProps } from '../InjectOverrides';

const Root = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1, 0),
}));

const Header = styled('div')(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.secondary.light,
  borderRadius: theme.shape.borderRadius,
}));

const HeaderItemBase = styled('div')(({ theme }) => ({
  'fontSize': '0.75rem',
  'fontWeight': 600,
  'lineHeight': '1.5rem',
  'color': theme.palette.text.secondary,
  'textTransform': 'uppercase',
  'overflow': 'hidden',
  'padding': theme.spacing(0, 1.5),
  '&:first-of-type': {
    paddingLeft: theme.spacing(2),
  },
  '&:last-of-type': {
    paddingRight: theme.spacing(2),
  },
}));

const HeaderItem = InjectOverrides(HeaderItemBase);

const RowRoot = styled('div')(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

const Row = ({
  children,
  details,
}: {
  children: React.ReactNode;
  details?: (expanded: boolean) => React.ReactNode;
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const handleToggleExpansion = () => setExpanded((prev) => !prev);

  useEffect(() => {
    setExpanded(false);
  }, [details]);

  return (
    <RowRoot>
      {children}
      {!!details && (
        <RowActions>
          <IconButton size="small" onClick={handleToggleExpansion}>
            <SvgIcon>{expanded ? <AngleUp /> : <AngleDown />}</SvgIcon>
          </IconButton>
        </RowActions>
      )}
      <Collapse in={expanded} sx={{ gridColumn: '1 / -1' }}>
        <Divider sx={{ mt: 1 }} />
        <RowItemBase>{!!details && details(expanded)}</RowItemBase>
      </Collapse>
    </RowRoot>
  );
};

const RowItemBase = styled('div')(({ theme }) => ({
  'fontSize': '0.875rem',
  'fontWeight': 400,
  'lineHeight': '1.5rem',
  'color': theme.palette.text.primary,
  'alignSelf': 'center',
  'overflow': 'hidden',
  'textOverflow': 'ellipsis',
  'minWidth': 0,
  'padding': theme.spacing(0, 1.5),
  '&:first-of-type': {
    paddingLeft: theme.spacing(2),
  },
  '&:last-of-type': {
    paddingRight: theme.spacing(2),
  },
}));

const RowItem = InjectOverrides(RowItemBase);

const RowActions = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 0.5, 0, 1.5),
}));

interface TableGridProps<ItemType> {
  data: ItemType[];
  dataMap: {
    key: string;
    title: string;
    render: (item: ItemType) => React.ReactNode;
    overrides?: Partial<
      Record<
        Breakpoint,
        Partial<
          React.ClassAttributes<HTMLDivElement> &
            React.HTMLAttributes<HTMLDivElement>
        >
      >
    >;
  }[];
  gridTemplateColumns?: string;
  isLoading: boolean;
  renderDetails?: (item: ItemType, expanded: boolean) => React.ReactNode;
}

const TableGridBase = <ItemType extends object>({
  data,
  isLoading,
  dataMap,
  gridTemplateColumns,
  renderDetails,
}: TableGridProps<ItemType>) => {
  return (
    <Root
      style={{
        gridTemplateColumns: `${gridTemplateColumns}${renderDetails ? ' auto' : ''}`,
      }}
    >
      <Header>
        {dataMap.map((col) => (
          <HeaderItem key={col.key} overrides={col.overrides}>
            {col.title}
          </HeaderItem>
        ))}
        <HeaderItem />
      </Header>
      {!isLoading
        ? data.map((item, index) => (
            <Row
              key={index}
              details={
                renderDetails
                  ? (expanded) => renderDetails(item, expanded)
                  : undefined
              }
            >
              {dataMap.map((col) => (
                <RowItem key={col.key} overrides={col.overrides}>
                  {col.render(item)}
                </RowItem>
              ))}
            </Row>
          ))
        : Array(5)
            .fill(0)
            .map((_, index) => (
              <Skeleton
                variant="rounded"
                height={50}
                sx={{ gridColumn: '1/-1' }}
                key={index}
              />
            ))}
    </Root>
  );
};

export const TableGrid = InjectOverrides(TableGridBase) as <
  ItemType extends object,
>(
  props: TableGridProps<ItemType> &
    InjectOverridesProps<TableGridProps<ItemType>>,
) => React.JSX.Element;
