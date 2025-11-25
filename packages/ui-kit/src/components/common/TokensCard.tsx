import { Network, TokenInfoWithColdAmount } from '@rosen-ui/types';

import { Card, CardBody, CardHeader, CardTitle } from './card';
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
  <Card style={{ height: '100%' }} backgroundColor="background.paper">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardBody>
      <TokensList chain={chain} tokens={tokens ?? []} isLoading={isLoading} />
    </CardBody>
  </Card>
);
