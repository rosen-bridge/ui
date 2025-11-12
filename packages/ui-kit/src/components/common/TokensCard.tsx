import { Network, TokenInfoWithColdAmount } from '@rosen-ui/types';

import { FullCard } from './FullCard';
import { TokensList } from './TokensList';

export interface TokensCardProps {
  chain?: Network;
  title: string;
  tokens: TokenInfoWithColdAmount[];
  isLoading: boolean;
}
/**
 * a wrapper for `TokensList` which also renders a title and a "See All" action
 * button
 *
 * @param chain
 * @param title
 * @param tokens
 * @param isLoading
 */
export const TokensCard = ({
  chain,
  title,
  tokens,
  isLoading,
}: TokensCardProps) => (
  /**
   * TODO: Implement the See All Section and click handler as part of #9
   * local:ergo/rosen-bridge/ui#9
   */
  <FullCard title={title}>
    <TokensList chain={chain} tokens={tokens ?? []} isLoading={isLoading} />
  </FullCard>
);
