import { Typography } from '@mui/material';
import { Network, TokenInfoWithColdAmount } from '@rosen-ui/types';

import { Icon } from '../icon';
import { TokensList } from '../tokensList';
import { Button } from './Button';
import { Card, CardBody, CardHeader, CardTitle } from './card';

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
            endIcon={<Icon name="AngleRight" />}
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
      <TokensList chain={chain} tokens={tokens ?? []} loading={isLoading} />
    </CardBody>
  </Card>
);
