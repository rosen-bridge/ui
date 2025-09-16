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

import { format } from './format';

export type ItemAddressProps = {
  loading?: boolean;
  state: 'hot' | 'cold';
  value?: TokenInfoWithAddress;
};

export const ItemAddress = ({ loading, state, value }: ItemAddressProps) => {
  return (
    <div style={{ width: '100%' }}>
      <Stack
        gap={1}
        fontSize="1.5rem"
        flexDirection="row"
        alignItems="center"
        justifyContent="start"
        width="100%"
      >
        <SvgIcon
          sx={{
            color: (theme) =>
              state === 'hot'
                ? theme.palette.secondary.dark
                : theme.palette.tertiary.dark,
          }}
        >
          {state === 'hot' ? <Fire /> : <SnowFlake />}
        </SvgIcon>
        <Typography
          component="div"
          sx={{
            fontWeight: 700,
            fontSize: '1.5rem',
            color: (theme) =>
              state === 'hot'
                ? theme.palette.secondary.dark
                : theme.palette.tertiary.dark,
          }}
        >
          <Amount
            loading={loading}
            value={
              value &&
              format(
                getDecimalString(
                  value.balance.amount.toString(),
                  value.balance.decimals,
                ),
              )
            }
            unit={value?.balance.name ?? 'N/A'}
          />
        </Typography>
      </Stack>
      <Identifier
        href={getAddressUrl(value?.chain as NetworkType, value?.address) || ''}
        loading={loading}
        value={value?.address}
        copyable
        qrcode
      />
    </div>
  );
};
