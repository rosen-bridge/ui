'use client';

import React from 'react';

import { Fire, SnowFlake } from '@rosen-bridge/icons';
import {
  Amount,
  Identifier,
  Stack,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';
import { Network as NetworkType } from '@rosen-ui/types';
import { getAddressUrl, getDecimalString } from '@rosen-ui/utils';

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
        spacing={1}
        direction="row"
        align="center"
        justify="start"
        style={{ fontSize: '1.5rem', width: '100%' }}
      >
        <SvgIcon
          color={`${state === 'hot' ? 'secondary.dark' : 'tertiary.dark'}`}
        >
          {state === 'hot' ? <Fire /> : <SnowFlake />}
        </SvgIcon>
        <Typography
          color={`${state === 'hot' ? 'secondary.dark' : 'tertiary.dark'}`}
          component="div"
          fontWeight="700"
          fontSize="1.5rem"
        >
          <Amount
            loading={loading}
            value={
              value &&
              getDecimalString(
                value.balance.amount.toString(),
                value.balance.decimals,
              )
            }
            unit={value?.balance.name}
          />
        </Typography>
      </Stack>
      <Identifier
        href={getAddressUrl(value?.chain as NetworkType, value?.address)}
        loading={loading}
        value={value?.address || 'N/A'}
        copyable={!!value?.address}
        qrcode={!!value?.address}
        style={{ minHeight: '30px' }}
      />
    </div>
  );
};
