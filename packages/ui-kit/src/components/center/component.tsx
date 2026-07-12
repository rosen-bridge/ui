import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CenterOverrides {}

export type CenterOwnProps = {
  inline?: boolean;
};

export type CenterBaseProps = ElementBaseProps<'div', CenterOwnProps>;

export type CenterProps = OverridableType<
  CenterBaseProps,
  CenterOverrides,
  never
>;

export const Center = (props: CenterProps) => {
  const { inline, ...rest } = useConfig('Center', props);

  return <div data-inline={!!inline} {...rest} />;
};

Center.displayName = 'Center';
