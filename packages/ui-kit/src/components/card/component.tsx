import { ComponentProps, useMemo } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { ColorOverridden, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardOverrides {}

export type CardOwnProps = {
  /**
   * If `true`, the card will show an outline indicating it is active.
   */
  active?: boolean;

  /**
   * Background color of the card.
   */
  backgroundColor?: ColorOverridden;

  /**
   * If `true`, the card will show a pointer cursor on hover,
   * indicating it is clickable.
   */
  clickable?: boolean;

  /**
   * Visual variant of the card.
   */
  variant?: 'default' | 'section' | 'separated';
};

export type CardBaseProps = ElementBaseProps<'div', CardOwnProps>;

export type CardOverriddenProps = OverridableType<
  CardBaseProps,
  CardOverrides,
  'backgroundColor'
>;

export const CardBase = ({
  active,
  backgroundColor = 'background-paper',
  clickable,
  style,
  variant,
  ...rest
}: CardOverriddenProps) => {
  const styles = useMemo(
    () => ({
      backgroundColor: toCSSColor(backgroundColor),
      ...style,
    }),
    [backgroundColor, style],
  );

  return (
    <div
      data-active={!!active}
      data-clickable={!!clickable}
      data-variant={variant}
      style={styles}
      {...rest}
    />
  );
};

CardBase.displayName = 'Card';

export const Card = Wrap(CardBase);

export type CardProps = ComponentProps<typeof Card>;
