import { HTMLAttributes, useMemo } from 'react';

import {
  ExclamationTriangle,
  ExternalLinkAlt,
  Fire,
  SnowFlake,
} from '@rosen-bridge/icons';

import { IconButton, Skeleton, Tooltip, Typography } from '../../base';
import { InjectOverrides } from '../InjectOverrides';
import { Stack } from '../Stack';
import { SvgIcon } from '../SvgIcon';

export type AmountProps = HTMLAttributes<HTMLDivElement> & {
  /** Maximum fractional digits to render in the decimal part */
  decimalMaxFractionDigits?: number;

  /** How many leading zeros trigger compressed zero notation */
  decimalLeadingZeroThreshold?: number;

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
  decimalMaxFractionDigits = 3,
  decimalLeadingZeroThreshold = 3,
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

  const valueString = useMemo(() => {
    switch (typeof value) {
      case 'bigint':
        return value.toLocaleString();
      case 'number':
        return value.toLocaleString('fullwide', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 20,
        });
      case 'string':
        return value || '0';
      default:
        return '0';
    }
  }, [value]);

  const tooltip = useMemo(() => {
    return valueString?.replace(/^\d+/, (m) =>
      m.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    );
  }, [valueString]);

  const parts = useMemo(() => {
    if (error) return;

    const decimal = valueString.split('.').at(1)?.length || 0;

    const [numberStr = '0', decimalStr = '0'] = valueString.split('.');

    const numberParsed = BigInt(numberStr);

    if (numberParsed > 0n) {
      const units = ['', 'K', 'M', 'B', 'T'];

      const num = valueString.replace('.', '');

      const str = BigInt(num).toString().replace(/^0+/, '') || '0';

      const index = Math.min(
        Math.floor((str.length - 1 - decimal) / 3),
        units.length - 1,
      );

      const value = Number(num) / 10 ** decimal / 1000 ** index;

      const val = value.toFixed(decimalMaxFractionDigits).replace(/0+$/, '');

      const unit = units[index];

      return {
        unit,
        number: val.toString().split('.').at(0),
        fraction: val.toString().split('.').at(1) || '0',
      };
    }

    const leadingZeros = decimalStr.match(/^(0*)/)?.at(1)?.length || 0;

    const threshold =
      leadingZeros >= decimalLeadingZeroThreshold ? leadingZeros : 0;

    const precision =
      leadingZeros + decimalMaxFractionDigits - (threshold ? 1 : 0);

    let fraction = Number(`0.${decimalStr}`)
      .toFixed(precision)
      .replace(/^0\./, '')
      .replace(/0+$/, '');

    if (threshold) {
      fraction = fraction?.replace('0'.repeat(threshold), '');
    }

    return {
      number: '0',
      fraction,
      zeros: threshold,
    };
  }, [
    decimalLeadingZeroThreshold,
    decimalMaxFractionDigits,
    error,
    valueString,
  ]);

  const content = (
    <>
      {loading && (
        <Skeleton variant="text" width={80} style={{ marginRight: '4px' }} />
      )}
      {!loading && !!error && (
        <SvgIcon
          style={{
            marginRight: '4px',
            transform: 'translateY(20%)',
            fontSize: 'inherit',
          }}
        >
          <ExclamationTriangle />
        </SvgIcon>
      )}
      {!loading && !error && !!parts && (
        <Stack
          inline
          align="baseline"
          direction={orientation === 'vertical' ? 'column' : 'row'}
        >
          <Tooltip title={tooltip}>
            <Typography fontSize="inherit" component="span">
              {parts.number}
              {parts.fraction && (
                <Typography
                  component="span"
                  fontSize="75%"
                  style={{ opacity: 0.7 }}
                >
                  .{!!parts.zeros && '0'}
                  {!!parts.zeros && (
                    <sub style={{ fontSize: '0.75em' }}>{parts.zeros}</sub>
                  )}
                  {parts.fraction}
                </Typography>
              )}
              {!!parts.unit && ` ${parts.unit}`}
            </Typography>
          </Tooltip>
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
