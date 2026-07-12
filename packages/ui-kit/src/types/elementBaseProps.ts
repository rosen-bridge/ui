import type { ComponentPropsWithRef, ElementType } from 'react';

export type ElementBaseProps<E extends ElementType, P> = P &
  Omit<ComponentPropsWithRef<E>, keyof P>;
