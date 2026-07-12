import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

import { CubeNetSvg } from './CubeNet';
import './styles.css';

export interface CubeNetBackgroundOverrides {}

export type CubeNetBackgroundOwnProps = {};

export type CubeNetBackgroundBaseProps = ElementBaseProps<
  'div',
  CubeNetBackgroundOwnProps
>;

export type CubeNetBackgroundProps = OverridableType<
  CubeNetBackgroundBaseProps,
  CubeNetBackgroundOverrides,
  never
>;

export const CubeNetBackground = (props: CubeNetBackgroundProps) => {
  const { ...rest } = useConfig('CubeNetBackground', props);

  return (
    <div {...rest}>
      <CubeNetSvg color="primary" className="top" />
      <CubeNetSvg color="secondary" className="bottom" />
    </div>
  );
};

CubeNetBackground.displayName = 'CubeNetBackground';
