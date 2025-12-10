import { AngleRight } from '@rosen-bridge/icons';
import { Network, TokenInfoWithColdAmount } from '@rosen-ui/types';

import { Button } from './Button';
import { FullCard } from './FullCard';
import { SvgIcon } from './SvgIcon';
import { TokensList } from './TokensList';

export type TokensCardProps = {
  chain?: Network;
  title: string;
  tokens: TokenInfoWithColdAmount[];
  isLoading: boolean;
  href?: string;
};
/**
 * a wrapper for `TokensList` which also renders a title and a "See All" action
 * button
 *
 * @param chain
 * @param title
 * @param tokens
 * @param isLoading
 * @param href
 */
export const TokensCard = ({
  chain,
  title,
  tokens,
  isLoading,
  href,
}: TokensCardProps) => (
  /**
   * TODO: Implement the See All Section and click handler as part of #9
   * local:ergo/rosen-bridge/ui#9
   */
  <FullCard
    title={title}
    headerActions={
      href && (
        <Button
          variant="text"
          size="medium"
          target="_blank"
          href={href}
          endIcon={
            <SvgIcon>
              <AngleRight />
            </SvgIcon>
          }
        >
          See All
        </Button>
      )
    }
  >
    <TokensList chain={chain} tokens={tokens ?? []} isLoading={isLoading} />
  </FullCard>
);
