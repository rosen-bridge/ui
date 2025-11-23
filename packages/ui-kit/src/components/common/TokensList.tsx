import { Fire, SnowFlake } from '@rosen-bridge/icons';
import { Network, TokenInfoWithColdAmount } from '@rosen-ui/types';
import { getDecimalString, getTokenUrl } from '@rosen-ui/utils';

import { Typography } from '../base';
import { Avatar } from './Avatar';
import { Amount, Identifier } from './display';
import { Stack } from './Stack';
import { SvgIcon } from './SvgIcon';
import { Text } from './Text';

export interface TokensListProps {
  chain?: Network;
  tokens: TokenInfoWithColdAmount[];
  isLoading: boolean;
}
/**
 * render a list of `TokenListItem` or some skeletons for the same component
 *
 * @param tokens
 * @param isLoading
 */
export const TokensList = ({ chain, tokens, isLoading }: TokensListProps) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      rowGap: '16px',
    }}
  >
    {tokens.map((token) => {
      const hasCold = 'coldAmount' in token;
      return (
        <div
          key={token.tokenId}
          style={{
            display: 'grid',
            gridTemplateRows: 'auto auto',
            columnGap: '8px',
            gridTemplateColumns: 'subgrid',
            gridColumn: '1 / -1',
            alignItems: 'center',
          }}
        >
          <Avatar
            style={{
              gridRow: 'span 2',
            }}
            sx={{
              color: 'primary.main',
              bgcolor: 'primary.light',
              width: 44,
              height: 44,
            }}
          >
            {token.name?.at(0)}
          </Avatar>
          <Text loading={isLoading} style={{ minWidth: 0 }}>
            {token.name}
          </Text>
          <Stack direction="row" align="center" justify="end" spacing={0.5}>
            {hasCold && (
              <>
                <Amount
                  loading={isLoading}
                  value={getDecimalString(token.coldAmount, token.decimals)}
                />
                <SvgIcon color="tertiary.dark" size="16px">
                  <SnowFlake />
                </SvgIcon>
              </>
            )}
            {!hasCold && (
              <Amount
                loading={isLoading}
                value={getDecimalString(token.amount, token.decimals)}
              />
            )}
          </Stack>
          <Typography
            variant="body2"
            sx={{ color: (theme) => theme.palette.text.secondary, minWidth: 0 }}
          >
            <Identifier
              loading={isLoading}
              value={token.tokenId}
              href={
                token.isNativeToken
                  ? undefined
                  : getTokenUrl(chain, token.tokenId)
              }
            />
          </Typography>
          <Stack direction="row" align="center" justify="end" spacing={0.5}>
            {hasCold && (
              <>
                <Amount
                  loading={isLoading}
                  value={getDecimalString(token.amount, token.decimals)}
                />
                <SvgIcon color="secondary.dark" size="16px">
                  <Fire />
                </SvgIcon>
              </>
            )}
          </Stack>
        </div>
      )
    })}
  </div>
);
