import { useConfig } from '@/hooks';
import { ElementBaseProps, OverridableType } from '@/types';

import './styles.css';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EmptyStateOverrides {}

export type EmptyStateOwnProps = {
  showSubtitle?: boolean;
};

export type EmptyStateBaseProps = ElementBaseProps<'div', EmptyStateOwnProps>;

export type EmptyStateProps = OverridableType<
  EmptyStateBaseProps,
  EmptyStateOverrides,
  never
>;
/**
 * `EmptyState` is a reusable UI component that displays
 * a friendly message and an icon when there are no results to show.
 *
 * This component does not accept props and is fully static.
 */
export const EmptyState = (props: EmptyStateProps) => {
  const { showSubtitle, ...rest } = useConfig('EmptyState', props);

  return (
    <div {...rest}>
      <div className="RosenEmptyState-icon">
        <div className="RosenEmptyState-circle">
          <svg viewBox="0 0 24 24" width={40} height={40} fill="none">
            <path
              d="M21.71,20.29,18,16.61A9,9,0,1,0,16.61,18l3.68,3.68a1,1,0,0,0,1.42,0A1,1,0,0,0,21.71,20.29ZM11,18a7,7,0,1,1,7-7A7,7,0,0,1,11,18Z"
              fill="currentColor"
            />
          </svg>
          <div className="RosenEmptyState-count">0</div>
        </div>
      </div>
      <div className="RosenEmptyState-title">No results found!</div>
      {showSubtitle && (
        <div className="RosenEmptyState-subtitle">
          Adjust your filter and try again.
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
