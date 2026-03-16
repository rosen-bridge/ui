import { ComponentProps, ReactNode } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';
import { Typography } from '@/components';
import { useIsMobile } from '@/hooks';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PageHeadingOverrides { }

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

export const PageHeadingBase = ({ actions, title, ...rest }: PageHeadingOverriddenProps) => {
  const isMobile = useIsMobile();
  return (
    <Root reflects={{ mobile: isMobile }} {...rest}>
      <Typography variant="h1">{title}</Typography>
      {actions}
    </Root>
  );
};

PageHeadingBase.displayName = 'PageHeading';

export const PageHeading = Wrap(PageHeadingBase);

export type PageHeadingProps = ComponentProps<typeof PageHeading>;
