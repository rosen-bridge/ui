import { ComponentProps, ComponentPropsWithRef, ElementType } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ImageOverrides {}

export type ImageOwnProps = {
  as?: ElementType<ComponentPropsWithRef<'img'>>;
};

export type ImageBaseProps = ElementBaseProps<'img', ImageOwnProps>;

export type ImageOverriddenProps = OverridableType<
  ImageBaseProps,
  ImageOverrides,
  never
>;

export const ImageBase = ({
  as: Component = 'img',
  ...rest
}: ImageOverriddenProps) => {
  return <Component {...rest} />;
};

ImageBase.displayName = 'Image';

export const Image = Wrap(ImageBase);

export type ImageProps = ComponentProps<typeof Image>;
