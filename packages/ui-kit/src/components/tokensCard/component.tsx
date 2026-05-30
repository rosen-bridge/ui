import { Network, TokenInfoWithColdAmount } from '@rosen-ui/types';

import {
  Button,
  Card,
  CardAction,
  CardBody,
  CardHeader,
  CardTitle,
  Icon,
  TokensList,
} from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TokensCardOverrides {}

export type TokensCardOwnProps = {
  chain?: Network;
  href?: string;
  loading: boolean;
  title: string;
  tokens: TokenInfoWithColdAmount[];
};

export type TokensCardBaseProps = ElementBaseProps<'div', TokensCardOwnProps>;

export type TokensCardProps = OverridableType<
  TokensCardBaseProps,
  TokensCardOverrides,
  never
>;

/**
 * a wrapper for `TokensList` which also renders a title and a "See All" action
 * button
 */
export const TokensCard = (props: TokensCardProps) => {
  const { chain, href, loading, title, tokens, ...rest } = useConfig(
    'TokensCard',
    props,
  );

  return (
    <Card style={{ height: '100%' }} {...rest}>
      <CardHeader>
        <CardTitle fontWeight="700">{title}</CardTitle>
        {href && (
          <CardAction>
            <Button
              variant="text"
              size="medium"
              target="_blank"
              href={href}
              endIcon={<Icon name="AngleRight" />}
            >
              See All
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardBody>
        <TokensList chain={chain} loading={loading} tokens={tokens ?? []} />
      </CardBody>
    </Card>
  );
};

TokensCard.displayName = 'TokensCard';
