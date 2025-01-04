import { FC, ReactNode } from 'react';

import { Typography } from '../base';

export interface ConnectorProps {
  start: ReactNode;
  end: ReactNode;
}

export const Connector: FC<ConnectorProps> = ({ start, end }) => {
  const renderNode = (node: ReactNode): ReactNode => {
    return node;
  };

  return (
    <>
      {renderNode(start)}
      <Typography variant="h5" display="inline" mx={1}>
        →
      </Typography>
      {renderNode(end)}
    </>
  );
};
