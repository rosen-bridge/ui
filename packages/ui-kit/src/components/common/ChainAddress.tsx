import { FC } from 'react';

import { Network } from '@rosen-ui/types';
import { upperFirst } from 'lodash-es';

import { Typography } from '../base';
import { Id } from '../common';

export interface ChainAddressProps {
  from: string;
  to: string;
  isChain?: boolean;
}

export const ChainAddress: FC<ChainAddressProps> = ({ from, to, isChain }) => {
  return (
    <>
      {isChain ? (
        <>
          {upperFirst(from as Network)}
          <Typography variant="h5" display="inline" mx={1}>
            →
          </Typography>
          {upperFirst(to as Network)}
        </>
      ) : (
        <>
          <Id id={from} />
          <Typography variant="h5" display="inline" mx={1}>
            →
          </Typography>
          <Id id={to} />
        </>
      )}
    </>
  );
};
