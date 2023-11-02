import { TokenInfoWithColdAmount } from '@rosen-ui/types';

import { FullCard } from '.';
import { TokensList } from './tokensCard/TokensList';

export interface TokensCardProps {
  title: string;
  tokens: TokenInfoWithColdAmount[];
  isLoading: boolean;
}
/**
 * a wrapper for `TokensList` which also renders a title and a "See All" action
 * button
 *
 * @param title
 * @param tokens
 * @param isLoading
 */
export const TokensCard = ({ title, tokens, isLoading }: TokensCardProps) => (
  /**
   * TODO: Implement the See All Section and click handler as part of #9
   * local:ergo/rosen-bridge/ui#9
   */
  <FullCard title={title}>
    <TokensList tokens={tokens ?? []} isLoading={isLoading} />
  </FullCard>
);
