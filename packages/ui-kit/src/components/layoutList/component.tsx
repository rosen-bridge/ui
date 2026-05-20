import { ReactNode } from 'react';

import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LayoutListOverrides {}

export type LayoutListOwnProps = {
  pagination?: ReactNode;
  search?: ReactNode;
  sidebar?: ReactNode;
  sort?: ReactNode;
  view?: ReactNode;
};

export type LayoutListBaseProps = ElementBaseProps<'div', LayoutListOwnProps>;

export type LayoutListProps = OverridableType<
  LayoutListBaseProps,
  LayoutListOverrides,
  never
>;

export const LayoutList = (props: LayoutListProps) => {
  const { children, pagination, search, sidebar, sort, view, ...rest } =
    useConfig('LayoutList', props);

  return (
    <div {...rest}>
      <div className="RosenLayoutList-toolbar">
        <div className="RosenLayoutList-search">{search}</div>
        {sort && <div className="RosenLayoutList-sort">{sort}</div>}
        {view && <div className="RosenLayoutList-view">{view}</div>}
      </div>
      <div className="RosenLayoutList-body">
        <div className="RosenLayoutList-main">
          <div className="RosenLayoutList-content">{children}</div>
          <div className="RosenLayoutList-pagination">{pagination}</div>
        </div>
        {sidebar && <div className="RosenLayoutList-sidebar">{sidebar}</div>}
      </div>
    </div>
  );
};

LayoutList.displayName = 'LayoutList';
