import { ComponentProps, HTMLAttributes } from 'react';

import { Wrap } from '../../core';

export type CenterPropsBase = HTMLAttributes<HTMLDivElement> & {
  inline?: boolean;
};

export const CenterBase = ({ inline, ...rest }: CenterPropsBase) => {
  void inline;
  return <div {...rest} />;
};

CenterBase.displayName = 'Center';

export const Center = Wrap(CenterBase, {
  props: {
    inline: {
      reflect: true,
    },
  },
});

export type CenterProps = ComponentProps<typeof Center>;
