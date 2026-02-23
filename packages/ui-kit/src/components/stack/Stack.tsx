import { ComponentProps, HTMLAttributes, useMemo } from 'react';

import { GapOverridden, OverridableType } from '../../@types';
import { Wrap } from '../../core';

const ALIGN_MAP: Record<NonNullable<StackPropsBase['align']>, string> = {
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
  stretch: 'stretch',
};

const JUSTIFY_MAP: Record<NonNullable<StackPropsBase['justify']>, string> = {
  around: 'space-around',
  between: 'space-between',
  center: 'center',
  end: 'flex-end',
  start: 'flex-start',
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StackOverrides {}

export type StackPropsBase = HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'center' | 'end' | 'stretch';
  direction?: 'row' | 'column';
  gap?: GapOverridden;
  inline?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
};

export type StackPropsBaseOverridden = OverridableType<
  StackPropsBase,
  StackOverrides,
  'gap'
>;

export const StackBase = ({
  align,
  direction = 'column',
  gap,
  inline,
  justify,
  style,
  ...rest
}: StackPropsBaseOverridden) => {
  const styles = useMemo(
    () =>
      Object.assign(
        {},
        {
          display: inline ? 'inline-flex' : 'flex',
          flexDirection: direction,
          alignItems: align ? ALIGN_MAP[align] : undefined,
          justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
          gap,
        },
        style,
      ),
    [align, direction, gap, inline, justify, style],
  );

  return <div style={styles} {...rest} />;
};

StackBase.displayName = 'Stack';

export const Stack = Wrap(StackBase, {
  props: {
    gap: {
      parser: 'size',
    },
  },
});

export type StackProps = ComponentProps<typeof Stack>;
