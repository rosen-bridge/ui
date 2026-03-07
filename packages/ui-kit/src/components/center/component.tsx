import { ComponentProps } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CenterOverrides {}

export type CenterOwnProps = {
  inline?: boolean;
};

export type CenterBaseProps = ElementBaseProps<'div', CenterOwnProps>;

export type CenterOverriddenProps = OverridableType<
  CenterBaseProps,
  CenterOverrides,
  never
>;

export const CenterBase = ({ inline, ...rest }: CenterOverriddenProps) => {
  return <Root reflects={{ inline }} {...rest} />;
};

CenterBase.displayName = 'Center';

export const Center = Wrap(CenterBase);

export type CenterProps = ComponentProps<typeof Center>;
