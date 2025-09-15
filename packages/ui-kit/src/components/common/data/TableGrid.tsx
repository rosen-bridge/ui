import React from 'react';

import { styled } from '../../../styling';
import { InjectOverrides } from '../InjectOverrides';

const TableGridRoot = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1, 0),
}));
interface TableGridProps {
  gridTemplateColumns: string;
  children: React.ReactNode;
}
const TableGridBase = ({ gridTemplateColumns, children }: TableGridProps) => {
  return (
    <TableGridRoot style={{ gridTemplateColumns }}>{children}</TableGridRoot>
  );
};
export const TableGrid = InjectOverrides(TableGridBase);

export const TableGridHead = styled('div')(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.secondary.light,
  borderRadius: theme.shape.borderRadius,
}));

const TableGridHeadColBase = styled('div')(({ theme }) => ({
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
export const TableGridHeadCol = InjectOverrides(TableGridHeadColBase);

export const TableGridBodyRow = styled('div')(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  padding: theme.spacing(1, 0),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

interface TableGridBodyColProps {
  padding?: 'normal' | 'actions';
}
const TableGridBodyColBase = styled('div', {
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

export const TableGridBodyCol = InjectOverrides(TableGridBodyColBase);
