import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CardBodyOverrides {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type CardBodyOwnProps = {};

export type CardBodyBaseProps = ElementBaseProps<'div', CardBodyOwnProps>;

export type CardBodyProps = OverridableType<
  CardBodyBaseProps,
  CardBodyOverrides,
  never
>;

export const CardBody = (props: CardBodyProps) => {
  const { ...rest } = useConfig('CardBody', props);

  return <div {...rest} />;
};

CardBody.displayName = 'CardBody';
