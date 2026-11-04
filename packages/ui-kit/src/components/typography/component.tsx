import {
  Typography as TypographyMUI,
  type TypographyProps as TypographyPropsMUI,
} from '@mui/material';

import { Skeleton } from '@/components';
import { useConfig } from '@/hooks';
import type { Color, ElementBaseProps, OverridableType } from '@/types';
import { toCSSColor } from '@/utils';

import './styles.css';

export interface TypographyOverrides {}

export type TypographyOwnProps = TypographyPropsMUI & {
  color?: Color;
  loading?: boolean;
};

export type TypographyBaseProps = ElementBaseProps<typeof TypographyMUI, TypographyOwnProps>;

export type TypographyProps = OverridableType<TypographyBaseProps, TypographyOverrides, 'color'>;

export const Typography = (props: TypographyProps) => {
  const { children, color, loading, style, ...rest } = useConfig('Typography', props);

  return (
    <Skeleton disabled={!loading} variant="text">
      <TypographyMUI style={{ color: toCSSColor(color), ...style }} {...rest}>
        {children}
      </TypographyMUI>
    </Skeleton>
  );
};

Typography.displayName = 'Typography';
