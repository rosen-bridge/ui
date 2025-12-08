import { HTMLAttributes, useMemo } from 'react';

import {
  ExclamationTriangle,
  ExternalLinkAlt,
  Fire,
  SnowFlake,
} from '@rosen-bridge/icons';

import { IconButton, Skeleton, Typography } from '../../base';
import { InjectOverrides } from '../InjectOverrides';
import { Stack } from '../Stack';
import { SvgIcon } from '../SvgIcon';

export type AmountProps = HTMLAttributes<HTMLDivElement> & {
  /** Optional external link shown as an icon button */
  href?: string;

  /** If true, shows a skeleton instead of the value */
  loading?: boolean;

  /** Layout direction of value and unit ('horizontal' | 'vertical') */
  orientation?: 'horizontal' | 'vertical';

  /** Numeric value to display (bigint, number, or string) */
  value?: bigint | number | string;

  /** Unit label displayed next to the value (e.g. "USD") */
  unit?: string;

  /**
   * Variant of the Amount component.
   * - 'hot': displays a default icon on the left representing a positive/active state.
   * - 'cold': displays a default icon on the left representing a negative/inactive state.
   */
  variant?: 'hot' | 'cold';

  /**
   * If true, reverses the layout of the Amount component, moving the icon from left to right.
   */
  reverse?: boolean;
};

/**
 * Displays an amount value along with its unit, if available
 */
const AmountBase = ({
  href,
  loading,
  value,
  variant,
  reverse,
  orientation = 'horizontal',
  unit,
  ...props
}: AmountProps) => {
  const error = value !== undefined && isNaN(Number(value));

  const { number, decimals } = useMemo(() => {
    let number: string | undefined;
    let decimals: string | undefined;

    switch (typeof value) {
      case 'bigint': {
        number = value.toLocaleString();
        decimals = '0';
        break;
      }
      case 'number': {
        const sections = value
          .toLocaleString('fullwide', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 20,
          })
          .split('.');
        number = sections.at(0);
        decimals = sections.at(1) || '0';
        break;
      }
      case 'string': {
        const sections = value.split('.');
        number = sections.at(0)?.toLocaleString();
        decimals = sections.at(1) || '0';
        break;
      }
    }

    return { number, decimals };
  }, [value]);

  const content = (
    <>
      {loading ? (
        <Skeleton variant="text" width={80} style={{ marginRight: '4px' }} />
      ) : error ? (
        <SvgIcon
          style={{
            marginRight: '4px',
            transform: 'translateY(20%)',
            fontSize: 'inherit',
          }}
        >
          <ExclamationTriangle />
        </SvgIcon>
      ) : (
        <Stack
          inline
          align="baseline"
          direction={orientation === 'vertical' ? 'column' : 'row'}
        >
          <Typography fontSize="inherit" component="span">
            {number || '–'}
            {!loading && !error && !!decimals && (
              <Typography
                component="span"
                fontSize="75%"
                style={{ opacity: 0.7 }}
              >
                .{decimals}
              </Typography>
            )}
          </Typography>
          {unit && (
            <Typography
              fontSize="75%"
              component="div"
              style={{ opacity: 0.7, marginLeft: '4px' }}
            >
              {unit}
            </Typography>
          )}
        </Stack>
      )}

      {href && (
        <IconButton
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          href={href}
          style={{ marginLeft: '4px' }}
        >
          <SvgIcon size="small">
            <ExternalLinkAlt />
          </SvgIcon>
        </IconButton>
      )}
    </>
  );

  return (
    <Stack
      inline
      align="center"
      spacing="0.3em"
      direction={variant && reverse ? 'row-reverse' : 'row'}
      {...props}
    >
      {variant === 'hot' ? (
        <SvgIcon style={{ fontSize: 'inherit' }} color="secondary.dark">
          <Fire />
        </SvgIcon>
      ) : variant === 'cold' ? (
        <SvgIcon style={{ fontSize: 'inherit' }} color="tertiary.dark">
          <SnowFlake />
        </SvgIcon>
      ) : null}
      {content}
    </Stack>
  );
};

export const Amount = InjectOverrides(AmountBase);
