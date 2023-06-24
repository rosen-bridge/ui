'use client';

import useSWR from 'swr';

import { Button, FullCard, List } from '@rosen-bridge/ui-kit';

import TokenListItem from './TokenListItem';
import TokenListItemSkeleton from './TokenListItemSkeleton';

import fetcher from '@/_utils/fetcher';

import { ApiAddressAssetsResponse } from '@/_types/api';

const Tokens = () => {
  const { data: tokens, isLoading } = useSWR<ApiAddressAssetsResponse>(
    '/address/assets',
    fetcher
  );

  return (
    <FullCard
      title="Tokens"
      headerActions={
        <Button
          /**
           * TODO: Implement click handler as part of #9
           * https://git.ergopool.io/ergo/rosen-bridge/ui/-/issues/9
           */
          size="small"
        >
          See All
        </Button>
      }
    >
      {tokens ? (
        <List>
          {tokens.map((token, index) => (
            <TokenListItem
              decimals={token.decimals}
              id={token.tokenId}
              index={index}
              key={token.tokenId}
              name={token.name}
              value={token.amount.toString()}
            />
          ))}
        </List>
      ) : (
        isLoading && (
          <List>
            <TokenListItemSkeleton />
            <TokenListItemSkeleton />
          </List>
        )
      )}
    </FullCard>
  );
};

export default Tokens;
