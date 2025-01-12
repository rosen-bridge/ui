import { FC, ReactNode } from 'react';

import { Typography } from '../base';

export interface ConnectorProps {
  start: ReactNode;
  end: ReactNode;
}

export const Connector: FC<ConnectorProps> = ({ start, end }) => {
  return (
    <>
      {start}
      <Typography variant="h5" display="inline" mx={1}>
        →
      </Typography>
      {end}
    </>
  );
};
