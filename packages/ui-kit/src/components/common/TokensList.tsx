import { Network, TokenInfoWithColdAmount } from '@rosen-ui/types';
import { getTokenUrl } from '@rosen-ui/utils';

import { Avatar, Typography, Identifier, Stack, Amount } from '@/components';

export interface TokensListProps {
  chain?: Network;
  tokens: TokenInfoWithColdAmount[];
  isLoading: boolean;
}

/**
 * render a list of `TokenListItem` or some skeletons for the same component
 *
 * @param tokens
 * @param isLoading
 * @param chain
 */
export const TokensList = ({ chain, tokens, isLoading }: TokensListProps) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'auto auto 1fr',
      rowGap: '16px',
    }}
  >
    {tokens.map((token) => {
      const hasCold = 'coldAmount' in token;
      return (
        <div
          key={token.tokenId}
          style={{
            display: 'grid',
            gridTemplateRows: 'auto auto',
            columnGap: '8px',
            gridTemplateColumns: 'subgrid',
            gridColumn: '1 / -1',
            alignItems: 'center',
          }}
        >
          <Avatar
            loading={isLoading}
            color="primary"
            background="primary-light"
            size="44px"
            style={{
              gridRow: 'span 2',
            }}
          >
            {token.name?.at(0)}
          </Avatar>
          <Typography
            component="div"
            loading={isLoading}
            style={{ minWidth: 0 }}
          >
            {token.name}
          </Typography>
          <Stack direction="row" align="center" justify="end" spacing={0.5}>
            {hasCold && (
              <Amount
                variant="cold"
                reverse
                loading={isLoading}
                value={token.coldAmount}
                decimal={token.decimals}
              />
            )}
            {!hasCold && (
              <Amount
                loading={isLoading}
                value={token.amount}
                decimal={token.decimals}
              />
            )}
          </Stack>
          <Typography
            color="text-secondary"
            component="div"
            variant="body2"
            style={{ minWidth: 0 }}
          >
            <Identifier
              loading={isLoading}
              value={token.tokenId}
              href={
                token.isNativeToken
                  ? undefined
                  : getTokenUrl(chain, token.tokenId)
              }
            />
          </Typography>
          <Stack direction="row" align="center" justify="end" spacing={0.5}>
            {hasCold && (
              <Amount
                variant="hot"
                reverse
                loading={isLoading}
                value={token.amount}
                decimal={token.decimals}
              />
            )}
          </Stack>
        </div>
      );
    })}
  </div>
);
