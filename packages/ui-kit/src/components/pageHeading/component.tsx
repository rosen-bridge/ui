import { ReactNode } from 'react';

import { Typography } from '@/components';
import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PageHeadingOverrides {}

export type PageHeadingOwnProps = {
  actions?: ReactNode;
  title: string;
};

export type PageHeadingBaseProps = ElementBaseProps<'div', PageHeadingOwnProps>;

export type PageHeadingProps = OverridableType<
  PageHeadingBaseProps,
  PageHeadingOverrides,
  never
>;

export const PageHeading = (props: PageHeadingProps) => {
  const { actions, title, ...rest } = useConfig('PageHeading', props);

  return (
    <div {...rest}>
      <Typography variant="h1">{title}</Typography>
      {actions}
    </div>
  );
};

PageHeading.displayName = 'PageHeading';
