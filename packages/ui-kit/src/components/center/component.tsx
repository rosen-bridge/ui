import { ComponentProps } from 'react';

import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

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
  return <div data-inline={!!inline} {...rest} />;
};

CenterBase.displayName = 'Center';

export const Center = Wrap(CenterBase);

export type CenterProps = ComponentProps<typeof Center>;
