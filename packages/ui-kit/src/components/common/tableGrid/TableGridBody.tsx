import { forwardRef, HTMLAttributes, useMemo } from 'react';

import { InjectOverrides } from '../InjectOverrides';

export type TableGridBodyProps = HTMLAttributes<HTMLDivElement> & {};

const TableGridBodyBase = forwardRef<HTMLDivElement, TableGridBodyProps>(
  (props, ref) => {
    const { children, style, ...rest } = props;

    const styles = useMemo(() => {
      return Object.assign({}, { display: 'contents' }, style);
    }, [style]);

    return (
      <div style={styles} {...rest} ref={ref}>
        {children}
      </div>
    );
  },
);

TableGridBodyBase.displayName = 'TableGridBody';

export const TableGridBody = InjectOverrides(TableGridBodyBase);
