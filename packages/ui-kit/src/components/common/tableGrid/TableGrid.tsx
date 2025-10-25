import {
  forwardRef,
  HTMLAttributes,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { styled } from '../../../styling';
import { InjectOverrides } from '../InjectOverrides';
import { TableGridContext } from './useTableGrid';

const TableGridRoot = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1, 0),
}));

export type TableGridProps = HTMLAttributes<HTMLDivElement> & {};

const TableGridBase = forwardRef<HTMLDivElement, TableGridProps>(
  (props, ref) => {
    const { children, style, ...rest } = props;

    const [columns, setColumns] = useState<
      Array<{ index: number; props: { width?: string } }>
    >([]);

    const available = useCallback(
      (index: number) => {
        return columns.some((column) => column.index === index);
      },
      [columns],
    );

    const register = useCallback((index: number, props: { width?: string }) => {
      setColumns((columns) => {
        const filtered = columns.filter((column) => column.index !== index);

        filtered.push({ index, props });

        return filtered;
      });
    }, []);

    const unregister = useCallback((index: number) => {
      setColumns((columns) =>
        columns.filter((column) => column.index !== index),
      );
    }, []);

    const styles = useMemo(() => {
      return Object.assign(
        {},
        {
          gridTemplateColumns: columns
            .sort((a, b) => (a.index > b.index ? +1 : -1))
            .map((column) => column.props.width || 'auto')
            .join(' '),
        },
        style,
      );
    }, [columns, style]);

    const state = useMemo(
      () => ({
        available,
        register,
        unregister,
      }),
      [available, register, unregister],
    );

    return (
      <TableGridContext.Provider value={state}>
        <TableGridRoot style={styles} ref={ref} {...rest}>
          {children}
        </TableGridRoot>
      </TableGridContext.Provider>
    );
  },
);

TableGridBase.displayName = 'TableGrid';

export const TableGrid = InjectOverrides(TableGridBase);
