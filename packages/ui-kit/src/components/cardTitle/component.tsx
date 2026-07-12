import { Typography } from '@/components';
import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

export interface CardTitleOverrides {}

export type CardTitleOwnProps = {};

export type CardTitleBaseProps = ElementBaseProps<
  typeof Typography,
  CardTitleOwnProps
>;

export type CardTitleProps = OverridableType<
  CardTitleBaseProps,
  CardTitleOverrides,
  never
>;

export const CardTitle = (props: CardTitleProps) => {
  const { ...rest } = useConfig('CardTitle', props);

  return <Typography {...rest} />;
};

CardTitle.displayName = 'CardTitle';
