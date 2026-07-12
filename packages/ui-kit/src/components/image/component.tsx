import type { ComponentPropsWithRef, ElementType } from 'react';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

export interface ImageOverrides {}

export type ImageOwnProps = {
  as?: ElementType<ComponentPropsWithRef<'img'>>;
};

export type ImageBaseProps = ElementBaseProps<'img', ImageOwnProps>;

export type ImageProps = OverridableType<ImageBaseProps, ImageOverrides, never>;

export const Image = (props: ImageProps) => {
  const { as: Component = 'img', ...rest } = useConfig('Image', props);

  return <Component {...rest} />;
};

Image.displayName = 'Image';
