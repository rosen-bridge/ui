import { ComponentPropsWithRef, ElementType } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ImageOverrides {}

export type ImageOwnProps = {
  as?: ElementType<ComponentPropsWithRef<'img'>>;
};

export type ImageBaseProps = ElementBaseProps<'img', ImageOwnProps>;

export type ImageProps = OverridableType<ImageBaseProps, ImageOverrides, never>;

export const ImageBase = ({ as: Component = 'img', ...rest }: ImageProps) => {
  return <Component {...rest} />;
};

ImageBase.displayName = 'Image';

export const Image = Wrap(ImageBase);
