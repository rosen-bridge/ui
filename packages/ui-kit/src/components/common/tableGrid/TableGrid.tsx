import { ReactElement, useState } from 'react';

import { styled } from '../../../styling';
import { TableGridContext } from './TableGridContext';

interface TableGridProps {
  hasActionColumn?: boolean;
  children: ReactElement[];
}

const TableGridRoot = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1, 0),
}));

export const TableGrid = ({ hasActionColumn, children }: TableGridProps) => {
  const [columns, setColumns] = useState<boolean[]>([]);
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
