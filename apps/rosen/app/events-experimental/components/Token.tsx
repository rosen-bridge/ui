import React from 'react';

import { capitalize } from 'lodash';
import { Avatar, styled, Typography } from '@rosen-bridge/ui-kit';


/**
 * Props for the Token component.
 * @property name - The token's name.
 * @property reverse - If true, show items in reverse order.
 */
interface TokenProps {
  name: string;
  reverse?: boolean;
}

const TokenRoot = styled('div')<Pick<TokenProps, 'reverse'>>(({ reverse }) => ({
  display: 'flex',
  flexDirection: !reverse ? 'row' : 'row-reverse',
  alignItems: 'center',
  fontSize: 'inherit',
  width: 'fit-content',
  gap: '0.5em',
}));

const TokenTextWrapper = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
}));

/**
 * Displays a token with an avatar and its name.
 *
 * @param name - The name of the token.
 * @param src - The URL or path for the token's avatar image.
 * @param reverse - If true, show items in reverse order.
 */
export const Token = ({ name, reverse }: TokenProps) => {
  const toCapitalize = capitalize(name);

  return (
    <TokenRoot reverse={reverse}>
      <Avatar

        sx={{ width: '1.5em ', height: '1.5em', fontSize: '1.5em' }}
      >
        {toCapitalize.slice(0, 1)}
      </Avatar>

      <TokenTextWrapper>
        <Typography sx={{ fontSize: 'inherit' }}>{toCapitalize}</Typography>
      </TokenTextWrapper>
    </TokenRoot>
  );
};
