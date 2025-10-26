import { forwardRef, HTMLAttributes } from 'react';

import { Box, Collapse } from '@mui/material';

import { Divider } from '../Divider';
import { InjectOverrides } from '../InjectOverrides';

export type TableGridBodyDetailsProps = HTMLAttributes<HTMLDivElement> & {
  expanded?: boolean;
};

const TableGridBodyDetailsBase = forwardRef<
  HTMLDivElement,
  TableGridBodyDetailsProps
>((props, ref) => {
  const { children, expanded, ...rest } = props;
  return (
    <Collapse
      in={expanded}
      sx={{
        gridColumn: '1 / -1',
        padding: (theme) => theme.spacing(0, 1.5),
      }}
      {...rest}
      ref={ref}
    >
      <Divider style={{ marginTop: '8px' }} />
      {children}
      <Box height={8} />
    </Collapse>
  );
});

TableGridBodyDetailsBase.displayName = 'TableGridBodyDetails';

export const TableGridBodyDetails = InjectOverrides(TableGridBodyDetailsBase);
