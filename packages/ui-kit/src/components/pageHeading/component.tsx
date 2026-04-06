import { ComponentProps, ReactNode } from 'react';

import { Typography } from '@/components';
import { ElementBaseProps, Wrap } from '@/core';
import { OverridableType } from '@/types';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PageHeadingOverrides {}

export type PageHeadingOwnProps = {
  actions?: ReactNode;
  title: string;
};

export type PageHeadingBaseProps = ElementBaseProps<'div', PageHeadingOwnProps>;

export type PageHeadingOverriddenProps = OverridableType<
  PageHeadingBaseProps,
  PageHeadingOverrides,
  never
>;

export const PageHeadingBase = ({
  actions,
  title,
  ...rest
}: PageHeadingOverriddenProps) => {
  return (
    <div {...rest}>
      <Typography variant="h1">{title}</Typography>
      {actions}
    </div>
  );
};

PageHeadingBase.displayName = 'PageHeading';

export const PageHeading = Wrap(PageHeadingBase);

export type PageHeadingProps = ComponentProps<typeof PageHeading>;
