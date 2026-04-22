import { useMemo } from 'react';

import { useConfig } from '@/hooks';
import { Color, ElementBaseProps, OverridableType } from '@/types';
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
  backgroundColor?: Color;

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

export type CardProps = OverridableType<
  CardBaseProps,
  CardOverrides,
  'backgroundColor'
>;

export const Card = (props: CardProps) => {
  const {
    active,
    backgroundColor = 'background-paper',
    clickable,
    style,
    variant,
    ...rest
  } = useConfig('Card', props);

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

Card.displayName = 'Card';
