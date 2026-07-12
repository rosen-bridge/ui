import type { ComponentPropsWithRef, ElementType } from 'react';

import { useConfig } from '@/hooks';
import type { ElementBaseProps, OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
