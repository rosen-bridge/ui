import { HTMLAttributes, useMemo } from 'react';

import { ExclamationTriangle, ExternalLinkAlt } from '@rosen-bridge/icons';

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
};

/**
 * Displays an amount value along with its unit, if available
 */
const AmountBase = ({
  href,
  loading,
  value,
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

  return (
    <Stack
      style={{
        display: 'inline-flex',
      }}
      align="baseline"
      direction="row"
      {...props}
    >
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
          style={{
            display: 'inline-flex',
          }}
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
    </Stack>
  );
};

export const Amount = InjectOverrides(AmountBase);
