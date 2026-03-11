import { ComponentProps, ComponentPropsWithRef, ElementType } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ImageOverrides { }

export type ImageOwnProps = {
  as?: ElementType<ComponentPropsWithRef<'img'>>;
};

export type ImageBaseProps = ElementBaseProps<'img', ImageOwnProps>;

export type ImageOverriddenProps = OverridableType<
  ImageBaseProps,
  ImageOverrides,
  never
>;

export const ImageBase = ({ as = 'img', ...rest }: ImageOverriddenProps) => {
  return <Root as={as} {...rest} />
};

ImageBase.displayName = 'Image';

export const Image = Wrap(ImageBase);

export type ImageProps = ComponentProps<typeof Image>;
