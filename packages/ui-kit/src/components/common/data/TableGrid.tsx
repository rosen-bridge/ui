import React from 'react';

import { BreakpointQuery, useBreakpoint } from '../../../hooks';
import { styled } from '../../../styling';

const TableGridContext = React.createContext<{
  columns: boolean[];
  setColumns: React.Dispatch<React.SetStateAction<boolean[]>>;
}>({ columns: [], setColumns: () => {} });

const TableGridRoot = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1, 0),
}));
interface TableGridProps {
  hasActionColumn?: boolean;
  children: React.ReactElement[];
}
export const TableGrid = ({ hasActionColumn, children }: TableGridProps) => {
  const [columns, setColumns] = React.useState<boolean[]>([]);
  const numberOfColumns = columns.filter(Boolean).length;

  return (
    <TableGridContext.Provider value={{ columns, setColumns }}>
      <TableGridRoot
        style={{
          gridTemplateColumns: `repeat(${numberOfColumns},1fr)${hasActionColumn ? ' auto' : ''}`,
        }}
      >
        {children}
      </TableGridRoot>
    </TableGridContext.Provider>
  );
};

const TableGridHeadRoot = styled('div')(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.secondary.light,
  borderRadius: theme.shape.borderRadius,
}));
interface TableGridHeadProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement<TableGridHeadColProps>[];
}
export const TableGridHead = ({
  children,
  ...restProps
}: TableGridHeadProps) => {
  return (
    <TableGridHeadRoot {...restProps}>
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, { key: index, index });
      })}
    </TableGridHeadRoot>
  );
};

type TableGridHeadColProps = React.HTMLAttributes<HTMLDivElement> & {
  hideOn?: BreakpointQuery;
  index?: number;
};
const TableGridHeadColRoot = styled('div')(({ theme }) => ({
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
export const TableGridHeadCol = ({
  hideOn,
  index,
  ...restProps
}: TableGridHeadColProps) => {
  const { setColumns } = React.useContext(TableGridContext);
  const hide = useBreakpoint(hideOn || 'mobile-down');
  const display = !hideOn || (hideOn && !hide);
  React.useEffect(() => {
    setColumns((prev) => {
      const next = [...prev];
      next[index ?? 0] = display;
      return next;
    });
  }, [display, index, setColumns]);

  if (display) return <TableGridHeadColRoot {...restProps} />;
  return null;
};

export const TableGridBody = styled('div')(() => ({
  display: 'contents',
}));

const TableGridBodyRowRoot = styled('div')(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));
interface TableGridBodyRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement<TableGridBodyColProps>[];
}
export const TableGridBodyRow = ({
  children,
  ...restProps
}: TableGridBodyRowProps) => {
  return (
    <TableGridBodyRowRoot {...restProps}>
      {React.Children.map(children, (child, index) => {
        return React.cloneElement(child, {
          key: index,
          index,
        });
      })}
    </TableGridBodyRowRoot>
  );
};

interface TableGridBodyColProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'normal' | 'actions';
  index?: number;
}
const TableGridBodyColRoot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'padding',
})<TableGridBodyColProps>(({ theme, padding = 'normal' }) => ({
  alignSelf: 'center',
  minWidth: 0,
  color: theme.palette.text.primary,
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: '1.5rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  ...(padding === 'normal' && {
    'padding': theme.spacing(0, 1.5),
    '&:first-of-type': {
      paddingLeft: theme.spacing(2),
    },
    '&:last-of-type': {
      paddingRight: theme.spacing(2),
    },
  }),
  ...(padding === 'actions' && {
    padding: theme.spacing(0, 0.5, 0, 1.5),
  }),
}));
export const TableGridBodyCol = ({
  index,
  ...restProps
}: TableGridBodyColProps) => {
  const { columns } = React.useContext(TableGridContext);
  const display = columns[index ?? 0] || columns[index ?? 0] === undefined;
  if (display) return <TableGridBodyColRoot {...restProps} />;
  return null;
};
