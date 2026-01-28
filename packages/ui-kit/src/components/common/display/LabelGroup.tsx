import { HTMLAttributes, ReactNode } from 'react';

import { Box } from '../../base';
import { InjectOverrides } from '../InjectOverrides';

type LabelGroupBaseProps = {
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const LabelGroupBase = ({ children, ...rest }: LabelGroupBaseProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto auto 1fr',
        '& .rosen-label-horizontal': {
          gridColumn: '1 / 4',
          display: 'grid',
          gridTemplateColumns: 'subgrid',
          '.rosen-label-inset': {
            gridColumn: '1 / 2',
          },
          '.rosen-label-container': {
            gridColumn: '2 / 4',
            display: 'grid',
            gridTemplateColumns: 'subgrid',
          },
          '.rosen-label-label': {
            gridColumn: '1 / 2',
          },
        },
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export const LabelGroup = InjectOverrides(LabelGroupBase);
