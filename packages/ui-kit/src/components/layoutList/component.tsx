import { ComponentProps, ReactNode } from 'react';

import { OverridableType } from '@/@types';
import { ElementBaseProps, Root, Wrap } from '@/core';

import './styles.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LayoutListOverrides { }

export type LayoutListOwnProps = {
  pagination?: ReactNode;
  search?: ReactNode;
  sidebar?: ReactNode;
  sort?: ReactNode;
  view?: ReactNode;
};

export type LayoutListBaseProps = ElementBaseProps<'div', LayoutListOwnProps>;

export type LayoutListOverriddenProps = OverridableType<
  LayoutListBaseProps,
  LayoutListOverrides,
  never
>;

export const LayoutListBase = ({ children, pagination, search, sidebar, sort, view, ...rest }: LayoutListOverriddenProps) => {
  return (
    <Root {...rest}>
      <div className='toolbar'>
        <div className="search">
          {search}
        </div>
        {sort && (
          <div className="sort">
            {sort}
          </div>
        )}
        {view && (
          <div className="view">
            {view}
          </div>
        )}
      </div>
      <div className='body'>
        <div className='main'>
          <div className="content">
            {children}
          </div>
          <div className="pagination">
            {pagination}
          </div>
        </div>
        {sidebar && (
          <div className="sidebar">
            {sidebar}
          </div>
        )}
      </div>
    </Root>
  );
};

LayoutListBase.displayName = 'LayoutList';

export const LayoutList = Wrap(LayoutListBase);

export type LayoutListProps = ComponentProps<typeof LayoutList>;
