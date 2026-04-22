import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardHeaderOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CardHeaderOwnProps = {};

export type CardHeaderBaseProps = ElementBaseProps<'div', CardHeaderOwnProps>;

export type CardHeaderProps = OverridableType<
  CardHeaderBaseProps,
  CardHeaderOverrides,
  never
>;

export const CardHeader = (props: CardHeaderProps) => {
  const { ...rest } = useConfig('CardHeader', props);

  return <div {...rest} />;
};

CardHeader.displayName = 'CardHeader';
