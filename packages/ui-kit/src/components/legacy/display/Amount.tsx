import { type HTMLAttributes, useMemo } from 'react';

import { getDecimalString } from '@rosen-ui/utils';

import { Icon } from '../../icon';
import { IconButton } from '../../iconButton';
import { Stack } from '../../stack';
import { Text } from '../../text';
import { Tooltip } from '../../tooltip';

export type AmountProps = HTMLAttributes<HTMLDivElement> & {
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

  /**
   * Value to display, either a ready-to-display number (number or string) or a
   * raw integer value along with its decimals
   */
  value?:
    | number
    | string
    | {
        amount: bigint | number | string;
        decimals: number;
      };

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

  /**
   * Reference currency value per unit, used to compute and display an approximate total
   */
  price?: number;
};

/**
 * Displays an amount value along with its unit, if available
 */
const AmountBase = ({
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
  price,
  ...props
}: AmountProps) => {
  const isRawValue = typeof value === 'object' && value !== null;

  const rawValue = isRawValue ? value.amount : value;

  const decimals = isRawValue ? value.decimals : undefined;

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
    switch (typeof rawValue) {
      case 'bigint':
        return rawValue.toString();
      case 'number':
        if (Number.isNaN(rawValue)) return;
        return rawValue
          .toLocaleString('en', {
            useGrouping: false,
            minimumFractionDigits: 1,
            maximumFractionDigits: 20,
          })
          .replace(/\.0$/, '');
      case 'string':
        if (!rawValue.trim()) return;
        if (Number.isNaN(Number(rawValue))) return;
        return Number(rawValue)
          .toLocaleString('en', {
            useGrouping: false,
            minimumFractionDigits: 1,
            maximumFractionDigits: 20,
          })
          .replace(/\.0$/, '');
      default:
        return;
    }
  }, [rawValue]);

  const splittedValue = useMemo(() => {
    if (!normalizedValue) return;

    let value = normalizedValue;

    if (decimals !== undefined) {
      value = getDecimalString(normalizedValue, decimals)!;
    }

    return {
      number: value.split('.').at(0)!,
      decimal: value.split('.').at(1),
    };
  }, [decimals, normalizedValue]);

  const error = useMemo(() => {
    if (rawValue === undefined) return false;
    return !normalizedValue || (decimals !== undefined && !!normalizedValue.split('.').at(1));
  }, [decimals, normalizedValue, rawValue]);

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

      const index = Math.min(Math.floor((str.length - 1 - decimalLength) / 3), units.length - 1);

      const value = Number(num) / 10 ** decimalLength / 1000 ** index;

      const val = value.toFixed(decimalMaxFractionDigits).replace(/0+$/, '');

      const unit = units[index];

      return {
        unit,
        number: val.toString().split('.').at(0),
        fraction: val.toString().split('.').at(1) || '0',
      };
    }

    const leadingZeros = splittedValue.decimal?.match(/^(0*)/)?.at(1)?.length || 0;

    const threshold = leadingZeros >= decimalLeadingZeroThreshold ? leadingZeros : 0;

    const precision = leadingZeros + decimalMaxFractionDigits - (threshold ? 1 : 0);

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

  const formattedPrice = useMemo(() => {
    if (!splittedValue) return;

    if (price === undefined) return;

    const amount = +`${splittedValue.number}.${splittedValue.decimal || 0}`;

    if (Number.isNaN(amount)) return;

    const formatted = (amount * price).toLocaleString('en', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return formatted;
  }, [splittedValue, price]);

  const isIntegerDominant = useMemo(() => {
    if (!parts) return false;
    return parts.number === '0';
  }, [parts]);

  return (
    <Stack
      inline
      align="center"
      spacing="0.3em"
      direction={variant && reverse ? 'row-reverse' : 'row'}
      {...props}
    >
      {variant === 'cold' && (
        <Icon color="tertiary-dark" name="SnowFlake" style={{ fontSize: 'inherit' }} />
      )}
      {variant === 'hot' && (
        <Icon color="secondary-dark" name="Fire" style={{ fontSize: 'inherit' }} />
      )}
      <Stack align="center" direction="row">
        <Stack
          align={error ? 'center' : 'baseline'}
          direction={orientation === 'vertical' ? 'column' : 'row'}
          spacing="4px"
        >
          {!!error && <Icon name="ExclamationTriangle" style={{ fontSize: 'inherit' }} />}
          {!error && (
            <Tooltip disabled={loading} title={tooltip}>
              <Text
                as="div"
                variant="body1"
                loading={loading}
                style={{ fontSize: 'inherit' }}
                truncate
              >
                {!!parts && (
                  <>
                    <span
                      style={{
                        fontSize: isIntegerDominant ? '75%' : 'inherit',
                        opacity: isIntegerDominant ? 0.7 : 1,
                      }}
                    >
                      {parts.number}
                    </span>
                    {parts.fraction && (
                      <Text
                        as="span"
                        style={{
                          opacity: !isIntegerDominant ? 0.7 : 1,
                          fontSize: !isIntegerDominant ? '75%' : 'inherit',
                        }}
                      >
                        .{!!parts.zeros && '0'}
                        {!!parts.zeros && <sub style={{ fontSize: '0.75em' }}>{parts.zeros}</sub>}
                        {parts.fraction}
                      </Text>
                    )}
                    {!!parts.unit && ` ${parts.unit}`}
                  </>
                )}
              </Text>
            </Tooltip>
          )}
          {!error && !parts && !!fallback && rawValue === undefined && !loading && <>{fallback}</>}
          {unit && (
            <Text as="div" style={{ fontSize: '75%', opacity: 0.7 }}>
              {unit}
            </Text>
          )}
          {formattedPrice && <Text style={{ opacity: 0.5 }}>(${formattedPrice})</Text>}
        </Stack>
        {href && (
          <IconButton target="_blank" rel="noopener noreferrer" size="small" href={href}>
            <Icon name="ExternalLinkAlt" size="small" />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};

export const Amount = AmountBase;
