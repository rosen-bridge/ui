'use client';

import React from 'react';

import { Fire, SnowFlake } from '@rosen-bridge/icons';
import {
  Amount,
  Card,
  CardBody,
  Divider,
  Identifier,
  Network,
  Stack,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';
import { Network as NetworkType } from '@rosen-ui/types';
import { getAddressUrl, getDecimalString } from '@rosen-ui/utils';

import { TokenInfoWithAddress } from '@/_types/api';

type AddressProps = {
  loading?: boolean;
  state: 'hot' | 'cold';
  value?: TokenInfoWithAddress;
};

const Address = ({ loading, state, value }: AddressProps) => {
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
              getDecimalString(
                value.balance.amount.toString(),
                value.balance.decimals,
                3,
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

export type NetworkCardProps = {
  cold?: TokenInfoWithAddress;
  hot?: TokenInfoWithAddress;
  loading?: boolean;
  network?: NetworkType;
};

export const NetworkCard = ({
  cold,
  hot,
  loading,
  network,
}: NetworkCardProps) => {
  const error = !loading && (!network || !cold || !hot);
  return (
    <Card backgroundColor="background.paper">
      <CardBody>
        <Stack
          flexDirection="column"
          alignItems="stretch"
          justifyContent="start"
          gap={1}
        >
          {error && (
            <Typography color="error">
              Some required data is missing.
            </Typography>
          )}
          {!error && (
            <>
              <Network loading={loading} name={network} />
              <Address loading={loading} state="hot" value={hot} />
              <Divider variant="fullWidth" />
              <Address loading={loading} state="cold" value={cold} />
            </>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};
