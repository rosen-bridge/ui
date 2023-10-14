import { TokenInfo } from '@rosen-ui/types';

import { List } from '../../base';
import { TokenListItem } from './TokenListItem';
import { TokenListItemSkeleton } from './TokenListItemSkeleton';

export interface TokensListProps {
  tokens: TokenInfo[];
  isLoading: boolean;
}
/**
 * render a list of `TokenListItem` or some skeletons for the same component
 *
 * @param tokens
 * @param isLoading
 */
export const TokensList = ({ tokens, isLoading }: TokensListProps) => (
  <List>
    {isLoading ? (
      <>
        <TokenListItemSkeleton />
        <TokenListItemSkeleton />
      </>
    ) : (
      tokens.map((token, index) => (
        <TokenListItem
          decimals={token.decimals}
          id={token.tokenId}
          index={index}
          key={token.tokenId}
          name={token.name}
          value={token.amount.toString()}
          isNativeToken={token.isNativeToken}
        />
      ))
    )}
  </List>
);
