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
        'display': 'grid',
        'grid-template-columns': 'auto auto 1fr',
        '& .rosen-label-horizontal': {
          'grid-column': '1 / 4',
          'display': 'grid',
          'grid-template-columns': 'subgrid',
          '.rosen-label-inset': {
            'grid-column': '1 / 2',
          },
          '.rosen-label-container': {
            'grid-column': '2 / 4',
            'display': 'grid',
            'grid-template-columns': 'subgrid',
          },
          '.rosen-label-label': {
            'grid-column': '1 / 2',
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
