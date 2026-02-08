import { Typography } from '@mui/material';
import { AngleRight } from '@rosen-bridge/icons';
import { Network, TokenInfoWithColdAmount } from '@rosen-ui/types';

import { Button } from './Button';
import { Card, CardBody, CardHeader, CardTitle } from './card';
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
  <Card style={{ height: '100%' }} backgroundColor="background.paper">
    <CardHeader
      action={
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
      <CardTitle>
        <Typography fontWeight="700">{title}</Typography>
      </CardTitle>
    </CardHeader>
    <CardBody>
      <TokensList chain={chain} tokens={tokens ?? []} isLoading={isLoading} />
    </CardBody>
  </Card>
);
