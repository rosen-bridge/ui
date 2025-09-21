import { ReactNode } from 'react';

import { Box, Collapse, Divider } from '../../base';
import { TableGridBodyCol } from './TableGridBodyCol';

interface TableGridBodyDetailsProps {
  expanded: boolean;
  children: ReactNode;
}

export const TableGridBodyDetails = ({
  children,
  expanded,
}: TableGridBodyDetailsProps) => {
  return (
    <Collapse in={expanded} sx={{ gridColumn: '1 / -1' }}>
      <Divider sx={{ mt: 1 }} />
      <TableGridBodyCol>{children}</TableGridBodyCol>
      <Box height={8} />
    </Collapse>
  );
};
