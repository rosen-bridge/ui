import { ComponentProps } from 'react';

import { TokenInfoWithColdAmount } from '@rosen-ui/types';
import { getTokenUrl } from '@rosen-ui/utils';

import { Amount, Identifier, NetworkProps, Token } from '@/components';
import { ElementBaseProps, Root, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TokensListOverrides {}

export type TokensListOwnProps = {
  chain?: NetworkProps['value'];
  loading: boolean;
  tokens: TokenInfoWithColdAmount[];
};

export type TokensListBaseProps = ElementBaseProps<'div', TokensListOwnProps>;

export type TokensListOverriddenProps = OverridableType<
  TokensListBaseProps,
  TokensListOverrides,
  never
>;

/**
 * render a list of `TokenListItem` or some skeletons for the same component
 */
export const TokensListBase = ({
  chain,
  loading,
  tokens,
  ...rest
}: TokensListOverriddenProps) => {
  return (
    <Root {...rest}>
      {tokens.map((token) => {
        const hasCold = 'coldAmount' in token;
        return (
          <div className="RosenTokensList-item" key={token.tokenId}>
            <Token
              label={token.name}
              loading={loading}
              variant="logo"
              slots={{
                fallback: {
                  color: 'primary',
                  background: 'primary-light',
                  size: '44px',
                },
              }}
              style={{
                gridRow: 'span 2',
              }}
            />
            <Token
              label={token.name}
              loading={loading}
              style={{ minWidth: 0 }}
              variant="label"
            />
            <Amount
              decimal={token.decimals}
              loading={loading}
              reverse={hasCold}
              value={hasCold ? token.coldAmount : token.amount}
              variant={hasCold ? 'cold' : undefined}
            />
            <Identifier
              href={
                token.isNativeToken
                  ? undefined
                  : getTokenUrl(chain, token.tokenId)
              }
              loading={loading}
              slots={{ text: { color: 'text-secondary', variant: 'body2' } }}
              value={token.tokenId}
            />
            {hasCold ? (
              <Amount
                decimal={token.decimals}
                loading={loading}
                reverse
                value={token.amount}
                variant="hot"
              />
            ) : (
              <div />
            )}
          </div>
        );
      })}
    </Root>
  );
};

TokensListBase.displayName = 'TokensList';

export const TokensList = Wrap(TokensListBase);

export type TokensListProps = ComponentProps<typeof TokensList>;
