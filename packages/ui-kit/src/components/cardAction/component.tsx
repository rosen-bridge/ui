import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardActionOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CardActionOwnProps = {};

export type CardActionBaseProps = ElementBaseProps<'div', CardActionOwnProps>;

export type CardActionProps = OverridableType<
  CardActionBaseProps,
  CardActionOverrides,
  never
>;

export const CardAction = (props: CardActionProps) => {
  const { ...rest } = useConfig('CardAction', props);

  return <div {...rest} />;
};

CardAction.displayName = 'CardAction';
