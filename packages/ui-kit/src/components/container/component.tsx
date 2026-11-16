import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType, Width } from '@/types';
import { toCSSUnit } from '@/utils';

import './styles.css';

export interface ContainerOverrides {}

export type ContainerOwnProps = {
  maxWidth?: Width;
};

export type ContainerBaseProps = ElementBaseProps<'div', ContainerOwnProps>;

export type ContainerProps = OverridableType<ContainerBaseProps, ContainerOverrides, 'maxWidth'>;

export const Container = (props: ContainerProps) => {
  const { maxWidth, style, ...rest } = useConfig('Container', props);

  const styles = { maxWidth: toCSSUnit('width', maxWidth), ...style };

  return <div style={styles} {...rest} />;
};

Container.displayName = 'Container';
