'use client';

import React from 'react';

import { Amount, Identifier, Stack, Typography } from '@rosen-bridge/ui-kit';
import { Network as NetworkType } from '@rosen-ui/types';
import { getAddressUrl } from '@rosen-ui/utils';

import { TokenInfoWithAddress } from '@/_types/api';

export type ItemAddressProps = {
  loading?: boolean;
  state: 'hot' | 'cold';
  value?: TokenInfoWithAddress;
};

export const ItemAddress = ({ loading, state, value }: ItemAddressProps) => {
  return (
    <div style={{ width: '100%' }}>
      <Stack
        direction="row"
        align="center"
        justify="start"
        style={{ fontSize: '1.5rem', width: '100%' }}
      >
        <Typography
          color={`${state === 'hot' ? 'secondary.dark' : 'tertiary.dark'}`}
          component="div"
          fontWeight="700"
          fontSize="1.5rem"
        >
          <Amount
            variant={state}
            loading={loading}
            value={value?.balance.amount}
            decimal={value?.balance.decimals}
            unit={value?.balance.name}
          />
        </Typography>
      </Stack>
      <Identifier
        href={getAddressUrl(value?.chain as NetworkType, value?.address)}
        loading={loading}
        value={value?.address}
        fallback="N/A"
        copyable
        qrcode
        style={{ minHeight: '30px' }}
      />
    </div>
  );
};
