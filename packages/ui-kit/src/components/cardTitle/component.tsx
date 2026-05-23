import { Typography } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardTitleOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
