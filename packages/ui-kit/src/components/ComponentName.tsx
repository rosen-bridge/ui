import { ComponentProps, forwardRef, HTMLAttributes, useMemo } from 'react';

import { OverridableValue, Wrap } from '../core';

// eslint-disable-next-line 
export interface MyComponentProp3Overrides { }

/**
 * TODO
 */
type MyComponentPropsBase = HTMLAttributes<HTMLDivElement> & {
  prop1?: number;
  prop2?: string;
  prop3?: OverridableValue<'value1' | 'value2', MyComponentProp3Overrides>;
};

/**
 * TODO
 */
const MyComponentBase = forwardRef<HTMLDivElement, MyComponentPropsBase>((props, ref) => {
  const {
    children,
    prop1,
    prop2 = 'DEFUALT_VALUE',
    prop3,
    style,
    ...rest
  } = props;

  void prop1;
  void prop2;
  void prop3;

  const styles = useMemo(() => Object.assign(
    {},
    {
      // DEFAULT STYLES
    },
    style,
  ), [style]);

  return (
    <div ref={ref} style={styles} {...rest}>
      {children}
    </div>
  );
});

MyComponentBase.displayName = "MyComponent";

export const MyComponent = Wrap(MyComponentBase);

export type MyComponentProps = ComponentProps<typeof MyComponent>;


