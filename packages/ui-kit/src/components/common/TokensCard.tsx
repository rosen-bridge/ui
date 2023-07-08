import { TokenInfo } from '@rosen-ui/types';

import { FullCard } from '.';
import { Button } from '../base';
import { TokensList } from './tokensCard/TokensList';

export interface TokensCardProps {
  title: string;
  tokens: TokenInfo[];
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
  <FullCard
    title={title}
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
    <TokensList tokens={tokens ?? []} isLoading={isLoading} />
  </FullCard>
);
