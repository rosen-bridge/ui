import { HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react';

import { styled } from '../../../styling';
import { InjectOverrides } from '../InjectOverrides';
import { TableGridContext } from './useTableGrid';

const TableGridRoot = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1, 0),
}));

export type TableGridProps = HTMLAttributes<HTMLDivElement> & {};

const TableGridBase = ({ children }: TableGridProps) => {
  const [columns, setColumns] = useState<Array<{ index: number; props: { width?: string } }>>([]);

  const available = useCallback((index: number) => {
    return columns.some((column) => column.index === index);
  }, [columns]);

  const register = useCallback((index: number, props: { width?: string }) => {
    setColumns((columns) => {
      const filtered = columns.filter((column) => column.index !== index);

      filtered.push({ index, props });

      return filtered;
    });
  }, []);

  const unregister = useCallback((index: number) => {
    setColumns((columns) => columns.filter((column) => column.index !== index));
  }, []);

  const style = useMemo(() => ({
    gridTemplateColumns: columns
      .sort((a, b) => a.index > b.index ? +1 : -1)
      .map((column) => column.props.width || '1fr')
      .join(' ')
  }), [columns]);

  const state = useMemo(() => ({
    available,
    register,
    unregister
  }), [available, register, unregister]);

  useEffect(() => {
    console.log(11111, columns)
  }, [columns])

  return (
    <TableGridContext.Provider value={state}>
      <TableGridRoot style={style}>
        {children}
      </TableGridRoot>
    </TableGridContext.Provider>
  );
};

export const TableGrid = InjectOverrides(TableGridBase);
