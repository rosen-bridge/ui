'use client';

import { Amount, Identifier, Stack, Text } from '@rosen-bridge/ui-kit';
import type { Network as NetworkType } from '@rosen-ui/types';
import { getAddressUrl } from '@rosen-ui/utils';

import type { TokenInfoWithAddress } from '@/types/api';

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
        <Text
          color={`${state === 'hot' ? 'secondary-dark' : 'tertiary-dark'}`}
          as="div"
          variant="display1"
        >
          <Amount
            variant={state}
            loading={loading}
            value={value?.balance}
            unit={value?.balance.name}
          />
        </Text>
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
