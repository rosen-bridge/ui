import { HTMLAttributes, useMemo } from 'react';

import {
  ExclamationTriangle,
  ExternalLinkAlt,
  Fire,
  SnowFlake,
} from '@rosen-bridge/icons';
import { getDecimalString } from '@rosen-ui/utils';

import { IconButton, Skeleton, Tooltip, Typography } from '../../base';
import { InjectOverrides } from '../InjectOverrides';
import { Stack } from '../Stack';
import { SvgIcon } from '../SvgIcon';

export type AmountProps = HTMLAttributes<HTMLDivElement> & {
  /** Number of decimal places to shift the value before formatting */
  decimal?: number;

  /** Maximum fractional digits to render in the decimal part */
  decimalMaxFractionDigits?: number;

  /** How many leading zeros trigger compressed zero notation */
  decimalLeadingZeroThreshold?: number;

  /** Content shown when no value is provided and the amount cannot be rendered */
  fallback?: string;

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
  decimal,
  decimalMaxFractionDigits = 3,
  decimalLeadingZeroThreshold = 3,
  fallback,
  href,
  loading,
  value,
  variant,
  reverse,
  orientation = 'horizontal',
  unit,
  ...props
}: AmountProps) => {
  /**
   * try to convert value to a valid string number with decimal if is available
   *
   * examples
   *   - undefined     -> undefined
   *   - ''           -> undefined
   *   - ' '          -> undefined
   *   - 'hi'         -> undefined
   *   - '1234h'      -> undefined
   *   - '1234.56k78' -> undefined
   *   - NaN          -> undefined
   *   - 12345        -> '12345'
   *   - '12345'      -> '12345'
   *   - '12345.6789' -> '12345.6789'
   *   - 12345.6789   -> '12345.6789'
   *   - '3e-12'      -> '0.000000000003'
   *   - 12345n       -> '12345'
   */
  const normalizedValue = useMemo(() => {
    switch (typeof value) {
      case 'bigint':
        return value.toString();
      case 'number':
        if (isNaN(value)) return;
        return value
          .toLocaleString('en', {
            useGrouping: false,
            minimumFractionDigits: 1,
            maximumFractionDigits: 20,
          })
          .replace(/\.0$/, '');
      case 'string':
        if (!value.trim()) return;
        if (isNaN(Number(value))) return;
        return Number(value)
          .toLocaleString('en', {
            useGrouping: false,
            minimumFractionDigits: 1,
            maximumFractionDigits: 20,
          })
          .replace(/\.0$/, '');
      default:
        return;
    }
  }, [value]);

  const splittedValue = useMemo(() => {
    if (!normalizedValue) return;

    let value = normalizedValue;

    if (decimal !== undefined) {
      value = getDecimalString(normalizedValue, decimal)!;
    }

    return {
      number: value.split('.').at(0)!,
      decimal: value.split('.').at(1),
    };
  }, [decimal, normalizedValue]);

  const error = useMemo(() => {
    if (value === undefined) return false;
    return (
      !normalizedValue ||
      (decimal !== undefined && !!normalizedValue.split('.').at(1))
    );
  }, [decimal, normalizedValue, value]);

  const tooltip = useMemo(() => {
    if (!splittedValue) return '';

    const number = splittedValue.number.replace(/^\d+/, (m) =>
      m.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    );

    if (!splittedValue.decimal) return number;

    return `${number}.${splittedValue.decimal}`;
  }, [splittedValue]);

  const parts = useMemo(() => {
    if (!splittedValue) return;

    const decimalLength = splittedValue.decimal?.length || 0;

    if (BigInt(splittedValue.number) > 0n) {
      const units = ['', 'K', 'M', 'B', 'T'];

      const num = splittedValue.number + (splittedValue.decimal || '');

      const str = BigInt(num).toString().replace(/^0+/, '') || '0';

      const index = Math.min(
        Math.floor((str.length - 1 - decimalLength) / 3),
        units.length - 1,
      );

      const value = Number(num) / 10 ** decimalLength / 1000 ** index;

      const val = value.toFixed(decimalMaxFractionDigits).replace(/0+$/, '');

      const unit = units[index];

      return {
        unit,
        number: val.toString().split('.').at(0),
        fraction: val.toString().split('.').at(1) || '0',
      };
    }

    const leadingZeros =
      splittedValue.decimal?.match(/^(0*)/)?.at(1)?.length || 0;

    const threshold =
      leadingZeros >= decimalLeadingZeroThreshold ? leadingZeros : 0;

    const precision =
      leadingZeros + decimalMaxFractionDigits - (threshold ? 1 : 0);

    let fraction = Number(`0.${splittedValue.decimal || 0}`)
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
  }, [decimalLeadingZeroThreshold, decimalMaxFractionDigits, splittedValue]);

  return (
    <Stack
      inline
      align="center"
      spacing="0.3em"
      direction={variant && reverse ? 'row-reverse' : 'row'}
      {...props}
    >
      {variant === 'cold' && (
        <SvgIcon style={{ fontSize: 'inherit' }} color="tertiary.dark">
          <SnowFlake />
        </SvgIcon>
      )}
      {variant === 'hot' && (
        <SvgIcon style={{ fontSize: 'inherit' }} color="secondary.dark">
          <Fire />
        </SvgIcon>
      )}
      <Stack align="center" direction="row">
        <Stack
          align={error ? 'center' : 'baseline'}
          direction={orientation === 'vertical' ? 'column' : 'row'}
          spacing="4px"
        >
          <>
            {loading && <Skeleton variant="text" width={80} />}
            {!loading && !!error && (
              <SvgIcon
                style={{
                  fontSize: 'inherit',
                }}
              >
                <ExclamationTriangle />
              </SvgIcon>
            )}
            {!loading && !error && !!parts && (
              <Tooltip title={tooltip}>
                <Typography
                  fontSize="inherit"
                  component="span"
                  whiteSpace="nowrap"
                >
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
            )}
            {!loading &&
              !error &&
              !parts &&
              !!fallback &&
              value === undefined && <>{fallback}</>}
          </>
          {unit && (
            <Typography fontSize="75%" component="div" style={{ opacity: 0.7 }}>
              {unit}
            </Typography>
          )}
        </Stack>
        {href && (
          <IconButton
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            href={href}
          >
            <SvgIcon size="small">
              <ExternalLinkAlt />
            </SvgIcon>
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};

export const Amount = InjectOverrides(AmountBase);
